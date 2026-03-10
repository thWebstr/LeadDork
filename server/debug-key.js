import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testKey() {
  console.log("Testing API Key:", process.env.GEMINI_API_KEY);
  
  const models = ["gemini-3-flash-preview", "gemini-2.0-flash"];
  
  for (const modelName of models) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, respond with 'Success' if you can read this.");
      console.log(`Response from ${modelName}:`, result.response.text());
    } catch (err) {
      console.error(`Error with ${modelName}:`, err.message);
    }
  }
}

testKey();
