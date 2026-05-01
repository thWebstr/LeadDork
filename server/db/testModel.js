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
      console.log('Listing available models to find a compatible fallback...');
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: { 'x-goog-api-key': apiKey }
      });
      const data = await res.json();
      const candidate = (data.models || []).find(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'));
      if (!candidate) throw new Error('No compatible generative model found');
      console.log('Trying fallback model:', candidate.name);
      const model = genAI.getGenerativeModel({ model: candidate.name });
      const result = await model.generateContent('hello');
      console.log('Success with', candidate.name, ':', result.response.text());
    } catch (err2) {
      console.error('Fallback attempt failed:', err2.message);
    }
  }
}

testModel();
