import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  console.log("Listing models for key:", process.env.GEMINI_API_KEY);
  try {
    // Note: The SDK doesn't have a direct listModels method on genAI in some versions, 
    // but we can try to fetch it if we know the endpoint or use a different approach.
    // Actually, let's just try gemini-pro which is the most common one.
    const models = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            console.log(`Model ${m} is WORKING.`);
        } catch (e) {
            console.error(`Model ${m} FAILED:`, e.message);
        }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();
