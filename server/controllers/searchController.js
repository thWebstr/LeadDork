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
      "original_query": "YOUR_ORIGINAL_QUERY_HERE",
      "time_filter": null
    }
  ]
}

For the "time_filter" field:
- If the user mentions activity recency (e.g. "recently active", "last 30 days", "active this month", "last week", "last 24 hours"), set time_filter to the appropriate Google Search freshness code:
  - "qdr:d"  → last 24 hours
  - "qdr:w"  → last 7 days
  - "qdr:m"  → last month (~31 days)
  - "qdr:y"  → last year
- If no activity window is mentioned, set time_filter to null.

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
 * Per-person contact enrichment pipeline:
 *  Phase 1 → Run main LinkedIn dork, extract names from result titles
 *  Phase 2 → Fire one targeted contact dork per person in parallel
 *  Phase 3 → Build person-grouped snippets → Gemini extraction
 */
export const executeDorkScrape = async (req, res, next) => {
  try {
    const { dork, original_query, time_filter } = req.body;

    if (!dork) {
      return res.status(400).json({ success: false, error: 'Dork query is required for scraping' });
    }
    if (!SERP_API_KEY) {
      return res.status(500).json({ success: false, error: 'SerpApi Key is not configured on the server' });
    }

    const search = new GoogleSearch(SERP_API_KEY);

    // Helper: wraps SerpApi callback in a Promise; always resolves (never rejects)
    // time_filter maps to Google's tbs param (e.g. qdr:m = last month)
    const runSearch = (query, num = 10, tbs = null) =>
      new Promise((resolve) => {
        const params = { engine: 'google', q: query, num };
        if (tbs) params.tbs = tbs;
        search.json(params, (result) => {
          resolve(result.error ? [] : (result.organic_results || []));
        });
      });

    // Phase 1: Main LinkedIn dork — apply time_filter as tbs if provided
    const linkedinResults = await runSearch(dork, 20, time_filter || null);

    if (linkedinResults.length === 0) {
      return res.json({ success: true, count: 0, leads: [] });
    }

    // Extract name from LinkedIn title — typical format: "John Doe - Title at Company | LinkedIn"
    // or "John Doe | LinkedIn"
    const extractName = (title = '') => {
      const match = title.match(/^([^|\-–]+)/);
      return match ? match[1].trim() : null;
    };

    // Pair each result with its extracted name
    const profilesWithNames = linkedinResults.map(r => ({
      result: r,
      name: extractName(r.title),
    }));

    // ─── PHASE 2: Per-person contact dorks (capped at 10 profiles) ────────────
    // For each person, search their name + contact signals across ALL platforms
    const CAP = 10;
    const profilesToEnrich = profilesWithNames.slice(0, CAP);

    const contactSearchPromises = profilesToEnrich.map(({ name }) => {
      if (!name) return Promise.resolve([]);
      // Broad contact dork: name + any contact signal, excluding LinkedIn noise
      const contactDork = `"${name}" (email OR "whatsapp" OR "wa.me" OR "contact" OR "@gmail" OR "@yahoo" OR "@outlook" OR phone) -site:linkedin.com`;
      return runSearch(contactDork, 5);
    });

    const contactResultsPerPerson = await Promise.all(contactSearchPromises);

    // ─── PHASE 3: Build per-person snippet blocks → single Gemini call ────────
    const personBlocks = profilesToEnrich.map(({ result, name }, i) => {
      const contactResults = contactResultsPerPerson[i] || [];

      const linkedinBlock = [
        `=== PERSON: ${name || 'Unknown'} ===`,
        `[LinkedIn Profile]`,
        `Source: ${result.link}`,
        `Title: ${result.title}`,
        `Snippet: ${result.snippet || ''}`,
      ].join('\n');

      const contactBlock = contactResults.length
        ? contactResults.map(c =>
            `[Contact Search Result for ${name}]\nSource: ${c.link}\nTitle: ${c.title}\nSnippet: ${c.snippet || ''}`
          ).join('\n')
        : `[No contact results found for ${name}]`;

      return `${linkedinBlock}\n${contactBlock}\n---`;
    });

    // Also append any LinkedIn results beyond the cap as LinkedIn-only entries
    const uncappedBlocks = profilesWithNames.slice(CAP).map(({ result, name }) =>
      [
        `=== PERSON: ${name || 'Unknown'} ===`,
        `[LinkedIn Profile]`,
        `Source: ${result.link}`,
        `Title: ${result.title}`,
        `Snippet: ${result.snippet || ''}`,
        `---`,
      ].join('\n')
    );

    const fullSnippetPayload = [...personBlocks, ...uncappedBlocks].join('\n\n');

    // ─── GEMINI EXTRACTION ────────────────────────────────────────────────────
    const extractionPrompt = `You are an expert lead data extractor. I will give you a set of Google search results grouped by person.
Each group starts with "=== PERSON: Name ===" and contains:
- A [LinkedIn Profile] snippet (name, title, company, LinkedIn URL)
- Zero or more [Contact Search Result for Name] snippets (may contain email, WhatsApp/phone, personal websites found across the web)

Your job: extract one JSON object per person. Return a JSON array.

RULES:
1. ONLY return valid JSON. No markdown formatting like \`\`\`json.
2. Every object MUST include these mandatory keys IN THIS ORDER:
   - "name": Full name from the person header
   - "email": Email address(es) found in ANY of their snippets. String if one, JSON array if multiple. null if none.
   - "phone_whatsapp": WhatsApp number ONLY — from wa.me/ links, numbers labelled "WhatsApp", or WhatsApp Business. null if only a generic phone number or nothing found.
   - "linkedin_url": Their LinkedIn profile URL (from linkedin.com/in/ source)
   - "website": Personal website/portfolio URL(s). String if one, JSON array if multiple. null if none.
3. After mandatory fields, ADD extra custom keys for: "${original_query || ''}".
   E.g. if user asked for github repos add "github_repo", for company add "company", etc.
4. If a field is not found anywhere in the person's snippets, set it to null. Never omit a key.
5. One object per "=== PERSON ===" block only. Do not invent extra leads.

Here is the data:
${fullSnippetPayload}
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', temperature: 0.1 });

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

    res.json({ success: true, count: extractedData.length, leads: extractedData });

  } catch (error) {
    console.error('SerpAPI/Gemini Extraction Error:', error);
    next(error);
  }
};





