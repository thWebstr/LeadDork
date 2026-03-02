import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hello");
    console.log('Success with gemini-1.5-flash:', result.response.text());
  } catch (err) {
    console.error('Failed with gemini-1.5-flash:', err.message);
    try {
        console.log('Trying gemini-pro...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("hello");
        console.log('Success with gemini-pro:', result.response.text());
    } catch (err2) {
        console.error('Failed with gemini-pro:', err2.message);
    }
  }
}

testModel();
