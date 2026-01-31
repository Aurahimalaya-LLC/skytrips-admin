
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');

async function listGeminiModels() {
  console.log('--- Listing Gemini Models ---');
  if (!process.env.GEMINI_API_KEY) return;
  try {
    // We can't easily list models with the high-level SDK 'getGenerativeModel'
    // But we can try a few known ones.
    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro",
      "gemini-1.5-pro-001",
      "gemini-1.0-pro",
      "gemini-pro"
    ];
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    for (const modelName of candidates) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS: ${modelName} worked! Response: ${result.response.text().substring(0, 20)}`);
            return modelName; // Stop after first success
        } catch (e) {
            console.log(`Failed ${modelName}: ${e.message.split('\n')[0]}`);
        }
    }
  } catch (error) {
    console.error('General Gemini Failure:', error.message);
  }
}

async function listClaudeModels() {
  console.log('\n--- Listing Claude Models ---');
  if (!process.env.ANTHROPIC_API_KEY) return;
  
  const candidates = [
    "claude-3-5-sonnet-20240620",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-3-opus-20240229"
  ];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  for (const modelName of candidates) {
    try {
        console.log(`Trying ${modelName}...`);
        const msg = await anthropic.messages.create({
            model: modelName,
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }],
        });
        console.log(`SUCCESS: ${modelName} worked!`);
        return modelName;
    } catch (e) {
        console.log(`Failed ${modelName}: ${e.message.split('\n')[0]}`);
    }
  }
}

async function run() {
  await listGeminiModels();
  await listClaudeModels();
}

run();
