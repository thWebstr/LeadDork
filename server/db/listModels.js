import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName}) - Methods: ${m.supportedGenerationMethods}`);
    });
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

listModels();
