import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: {
        responseMimeType: "application/json"
    }
});

// Define Zod Schema for robust validation
const SegmentSchema = z.object({
  flight_number: z.string().describe("Flight number like BA123"),
  airline_code: z.string().describe("Two letter airline code"),
  departure_airport: z.string().length(3).describe("IATA code"),
  arrival_airport: z.string().length(3).describe("IATA code"),
  departure_time: z.string().describe("ISO 8601 or raw string"),
  arrival_time: z.string().describe("ISO 8601 or raw string"),
  class: z.string().optional()
});

const PNRSchema = z.object({
  pnr_number: z.string().min(1, "PNR Number is required"),
  passengers: z.array(z.string()).min(1, "At least one passenger is required"),
  segments: z.array(SegmentSchema).min(1, "At least one flight segment is required")
});

export type ParsedPNR = z.infer<typeof PNRSchema>;

export async function parsePNR(pnrText: string): Promise<ParsedPNR> {
  if (!pnrText || pnrText.trim().length < 5) {
      throw new Error("Invalid input: PNR text is too short or empty");
  }

  try {
    const prompt = `
    You are an expert travel agent assistant. Your task is to parse raw PNR (Passenger Name Record) text into a structured JSON format. 
    Identify the PNR number (Booking Reference), Passengers, and Flight Segments.
    
    Validation Rules:
    - PNR Number must be present.
    - At least one passenger must be present.
    - At least one flight segment must be present.
    - Airport codes must be 3-letter IATA codes.
    
    Structure:
    {
      "pnr_number": "string",
      "passengers": ["string"],
      "segments": [
        {
          "flight_number": "string",
          "airline_code": "string",
          "departure_airport": "string (IATA code)",
          "arrival_airport": "string (IATA code)",
          "departure_time": "ISO 8601 string or raw string if unknown",
          "arrival_time": "ISO 8601 string or raw string if unknown",
          "class": "string (optional)"
        }
      ]
    }

    Raw PNR Text:
    ${pnrText}
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    if (!content) throw new Error("Empty response from AI");

    const rawData = JSON.parse(content);
    
    // Validate with Zod
    const validatedData = PNRSchema.parse(rawData);
    
    return validatedData;

  } catch (error) {
    if (error instanceof z.ZodError) {
        console.error("PNR Validation Error:", JSON.stringify(error.format(), null, 2));
        throw new Error(`Validation Failed: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    
    console.error("PNR Parsing Error:", error);
    
    if (error instanceof SyntaxError) {
        throw new Error("AI returned invalid JSON");
    }
    
    throw new Error("Failed to parse PNR data: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}
