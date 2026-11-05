export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in Vercel Environment Variables.' });
  }

  const systemInstruction = `You are an elite expert web app generator. 
Generate a single-file, self-contained, highly interactive, production-ready HTML file.
RULES:
1. Output ONLY the raw HTML code. Do NOT wrap in markdown blocks like \`\`\`html or \`\`\`. Start directly with <!DOCTYPE html>.
2. Include modern styles using Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>) and Google Fonts (Plus Jakarta Sans).
3. Ensure rich interactivity using pure vanilla JavaScript. All logic, state, and UI calculation must be completely functional.
4. The tool must look modern, clean, mobile-responsive, and visually appealing.
5. Do NOT try to access parent window tokens, cookies, or storage. Make it completely self-sufficient.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Tool Requirement: ${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Gemini API Error: ${errText}` });
    }

    const data = await response.json();
    let generatedHtml = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown formatting if any
    generatedHtml = generatedHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    return res.status(200).json({ html: generatedHtml });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
