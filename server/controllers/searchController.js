import { GoogleGenerativeAI } from '@google/generative-ai';
import pkg from 'google-search-results-nodejs';
const { GoogleSearch } = pkg;
import pool from '../config/db.js';
import dotenv from 'dotenv';
import util from 'util';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SERP_API_KEY = process.env.SERPAPI_KEY;

export const generateSearchDorks = async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const systemPrompt = `You are an expert sales recruiter and lead generation specialist who builds advanced Google dork queries to find LinkedIn profiles.
The user will describe their ideal lead in natural language.
Your job is to convert their intent into exactly 3 different variants of Google dork queries targeting LinkedIn profiles.

Your response MUST be ONLY valid JSON containing an array of objects. Do not include markdown formatting or conversational text.
Format:
{
  "variants": [
    {
      "label": "Short description of the dork's angle (e.g., 'Founders by title')",
      "dork": "site:linkedin.com/in/ \\"founder\\" \\"fintech\\" -intitle:\\"jobs\\"",
      "original_query": "YOUR_ORIGINAL_QUERY_HERE"
    }
  ]
}

The dork must always include site:linkedin.com/in/
Use combinations of exact quotes, OR limits, and exclusions (-).`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: systemPrompt 
    });

    const aiResponse = await model.generateContent(`Generate LinkedIn dorks for this query: ${query}`);
    const aiText = aiResponse.response.text();
    
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    let parsedData;
    
    try {
      parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', aiText);
      return res.status(500).json({ success: false, error: 'Failed to generate dorks' });
    }
    
    // Inject the raw query into the variants so frontend can pass it later
    const variants = parsedData.variants.map(v => ({...v, original_query: query}));

    // Save history (we still record the query and raw dorks)
    const { rows } = await pool.query(
      `INSERT INTO search_history (raw_query, generated_dorks) VALUES ($1, $2) RETURNING id`,
      [query, JSON.stringify(variants)]
    );
    const savedHistoryId = rows[0].id;
    
    res.json({
      success: true,
      variants,
      savedHistoryId
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.status === 401 || error.message?.includes('API key')) {
       return res.status(500).json({ success: false, error: 'API configuration error' });
    }
    next(error);
  }
};

/**
 * Phase 3 addition: Scrapes Google blindly in the background using SerpApi
 */
export const executeDorkScrape = async (req, res, next) => {
  try {
    const { dork, original_query } = req.body;

    if (!dork) {
      return res.status(400).json({ success: false, error: 'Dork query is required for scraping' });
    }

    if (!SERP_API_KEY) {
      return res.status(500).json({ success: false, error: 'SerpApi Key is not configured on the server' });
    }

    const search = new GoogleSearch(SERP_API_KEY);

    // Helper: run a single SerpApi search as a promise
    const runSearch = (query, num = 20) =>
      new Promise((resolve) => {
        search.json({ engine: 'google', q: query, num }, (result) => {
          // Resolve even on error so Promise.all never rejects — we'll just get 0 results
          resolve(result.error ? [] : (result.organic_results || []));
        });
      });

    // 1. Build a contact-enrichment dork targeting emails, WhatsApp, and personal sites
    //    outside LinkedIn so Gemini has real data to populate those fields.
    const contactDork = `"${original_query || 'professional'}" email OR "whatsapp" OR "wa.me" OR "@gmail.com" OR "@yahoo.com" OR "contact me" -site:linkedin.com`;

    // 2. Fire both searches in parallel to keep latency low
    const [linkedinResults, contactResults] = await Promise.all([
      runSearch(dork, 20),
      runSearch(contactDork, 10),
    ]);

    const allResults = [...linkedinResults, ...contactResults];

    if (allResults.length === 0) {
      return res.json({ success: true, count: 0, leads: [] });
    }

    // 3. Combine snippets from both searches — label the source so Gemini knows context
    const linkedinSnippets = linkedinResults
      .map(r => `[LinkedIn Result]\nSource: ${r.link}\nTitle: ${r.title}\nSnippet: ${r.snippet}\n---`)
      .join('\n');

    const contactSnippets = contactResults
      .map(r => `[Contact Enrichment Result]\nSource: ${r.link}\nTitle: ${r.title}\nSnippet: ${r.snippet}\n---`)
      .join('\n');

    const snippets = [linkedinSnippets, contactSnippets].filter(Boolean).join('\n\n');

    // 4. AI Extraction Prompt — Gemini now has both LinkedIn profiles AND contact pages
    const extractionPrompt = `You are an expert data scraper. I will provide you with two sets of Google Search snippets:
- [LinkedIn Result] snippets: contain profile information (name, title, company, LinkedIn URL)
- [Contact Enrichment Result] snippets: contain contact details (emails, WhatsApp numbers, websites) for similar people

Your job is to cross-reference these two sets and extract a structured JSON array of leads.

RULES:
1. ONLY return valid JSON. Do not include markdown formatting like \`\`\`json.
2. The JSON MUST be an array of objects.
3. Every object MUST ALWAYS include these mandatory keys, in this exact order first:
   - "name": Full name of the person (from LinkedIn results)
   - "email": Their email address(es). Scan ALL snippets thoroughly. If ONE email is found, return a string. If MORE THAN ONE, return a JSON array.
   - "phone_whatsapp": Their WhatsApp number ONLY. Look for wa.me/ links, numbers labelled "WhatsApp", or WhatsApp Business references in ANY snippet. Set to null if none found.
   - "linkedin_url": Their LinkedIn profile URL (from linkedin.com/in/ source links)
   - "website": Their personal website or portfolio URL(s). If ONE, return a string. If MORE THAN ONE, return a JSON array.
4. After those mandatory fields, ADD any extra custom keys based on the user's intent ("${original_query || ''}").
   For example: if they asked for github repos, add "github_repo"; if they asked for company, add "company"; etc.
5. If a mandatory or custom field cannot be found in ANY snippet, set its value to null. Do NOT omit the key.
6. Base the number of output objects on the number of distinct LinkedIn profiles found. Do not create phantom leads from the contact snippets alone.

Here is the raw scraped data:
${snippets}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      temperature: 0.1
    });

    const aiResponse = await model.generateContent(extractionPrompt);
    const aiText = aiResponse.response.text();

    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    let extractedData = [];

    try {
      extractedData = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch (e) {
      console.error('Failed to parse Gemini Extraction JSON:', aiText);
      const fallbackLeads = linkedinResults.map(r => ({ title: r.title, link: r.link, snippet: r.snippet }));
      return res.json({ success: true, count: fallbackLeads.length, leads: fallbackLeads, warning: 'AI extraction failed, returning raw results.' });
    }

    res.json({
      success: true,
      count: extractedData.length,
      leads: extractedData
    });
  } catch (error) {
    console.error('SerpAPI/Gemini Extraction Error:', error);
    next(error);
  }
};



