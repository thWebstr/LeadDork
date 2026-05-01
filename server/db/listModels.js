import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': apiKey }
    });
    const data = await res.json();
    const models = data.models || [];
    console.log('Available models:');
    models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName}) - Methods: ${m.supportedGenerationMethods}`);
    });
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

listModels();
