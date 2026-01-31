import { NextResponse } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // 60 seconds
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `
      Extract the following details from this passport/ID image:
      - First Name (Given Names)
      - Last Name (Surname)
      - Passport Number
      - Nationality
      - Date of Birth (format: YYYY-MM-DD)
      - Passport Expiry (format: YYYY-MM-DD)
      - Gender (Male or Female)
      - Title (Mr, Mrs, Ms, Miss, Dr, or Prof)
      - Date of Issue (format: YYYY-MM-DD)
      - Issue Country

      Return ONLY a JSON object with these keys: first_name, last_name, passport_number, nationality, dob, passport_expiry, gender, title, date_of_issue, issue_country.
      If a field is not found, use null.
      Ensure dates are in YYYY-MM-DD format.
    `;

    let jsonData;

    // Priority: Gemini -> Claude -> OpenAI
    // We will try each one if the previous one fails or keys are missing.

    const errorMessages: string[] = [];

    console.log("OCR Request received.");
    console.log("Gemini Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    console.log("Claude Key:", process.env.ANTHROPIC_API_KEY ? "Present" : "Missing");
    console.log("OpenAI Key:", process.env.OPENAI_API_KEY ? "Present" : "Missing");

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY && !jsonData) {
      try {
        console.log("Attempting Gemini API for OCR...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash as it is most likely to be available and free
        // If this fails, we will fall through to others
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Gemini expects base64 without prefix
        let base64Data = image;
        let mimeType = "image/jpeg";
        if (image.includes(",")) {
          const parts = image.split(",");
          base64Data = parts[1];
          const mimeMatch = parts[0].match(/:(\.*?);/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        }

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ]);

        const responseText = result.response.text();
        console.log("Gemini Response:", responseText.substring(0, 100) + "...");
        // Clean up markdown code blocks if present
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        jsonData = JSON.parse(cleanedText);
      } catch (err) {
        console.error("Gemini Detailed Error:", err);
        errorMessages.push(`Gemini Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 2. Try Claude (if jsonData is still null)
    if (process.env.ANTHROPIC_API_KEY && !jsonData) {
      try {
        console.log("Attempting Claude API for OCR...");
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Prepare image for Claude
        let base64Data = image;
        let mimeType = "image/jpeg"; // default

        if (image.includes(",")) {
          const parts = image.split(",");
          base64Data = parts[1];
          const mimeMatch = parts[0].match(/:(.*?);/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        }

        // Map common mime types to what Claude accepts if needed
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(mimeType)) {
             // If mime type is not supported by Claude, we might skip or default to jpeg
             // But let's try passing it as jpeg if unknown
             if (!validTypes.includes(mimeType)) mimeType = "image/jpeg";
        }
        
        const mediaType = mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        
        // Use claude-3-haiku-20240307 as it is the only one available for this key
        const msg = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          system: "You are a data extraction assistant. Extract data from the image and return ONLY valid JSON. Do not include markdown formatting, code blocks, or explanations. The JSON should be a flat object.",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        });

        const textBlock = msg.content[0];
                if (textBlock.type === 'text') {
                  const text = textBlock.text;
                  console.log("Claude Response:", text.substring(0, 100) + "...");
                  const jsonMatch = text.match(/\{[\s\S]*\}/);
                  jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
                }
              } catch (err) {
                 console.error("Claude Detailed Error:", err);
                 errorMessages.push(`Claude Error: ${err instanceof Error ? err.message : String(err)}`);
              }
            }

            // 3. Try OpenAI (if jsonData is still null)
            if (process.env.OPENAI_API_KEY && !jsonData) {
              try {
                console.log("Attempting OpenAI API for OCR...");
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                // OpenAI expects data URL or url
                let base64Image = image;
                if (!image.includes("data:image")) {
                    base64Image = `data:image/jpeg;base64,${image}`;
                }

                const response = await openai.chat.completions.create({
                  model: "gpt-4o",
                  messages: [
                    {
                      role: "user",
                      content: [
                        { type: "text", text: prompt },
                        {
                          type: "image_url",
                          image_url: {
                            url: base64Image,
                          },
                        },
                      ],
                    },
                  ],
                  response_format: { type: "json_object" },
                });

                const content = response.choices[0].message.content;
                if (content) {
                  console.log("OpenAI Response:", content.substring(0, 100) + "...");
                  jsonData = JSON.parse(content);
                }
              } catch (err) {
                console.error("OpenAI Detailed Error:", err);
                errorMessages.push(`OpenAI Error: ${err instanceof Error ? err.message : String(err)}`);
              }
            }

    if (!jsonData) {
      return NextResponse.json({ 
        error: "Failed to parse data from image using all available providers.", 
        details: errorMessages 
      }, { status: 500 });
    }

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("OCR Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
