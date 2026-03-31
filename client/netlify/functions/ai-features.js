// Netlify Function: AI Features Proxy (Google Gemini API)
// POST /.netlify/functions/ai-features?type=budget|fuel-coach
export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
    if (!GOOGLE_AI_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'GOOGLE_AI_KEY not configured' }) };
    }

    try {
        const type = event.queryStringParameters.type; // budget or fuel-coach
        const body = JSON.parse(event.body || '{}');
        
        let systemPrompt = '';
        let userPrompt = body.prompt || body.message || '';

        if (type === 'budget') {
            systemPrompt = `You are a professional financial planner. Based on the user's income and savings goals, suggest monthly budget limits for their expense categories. 
            Return ONLY a JSON object with:
            {
              "summary": "Short explanation of the strategy",
              "suggestions": [
                { "categoryId": "...", "categoryName": "...", "suggestedAmount": 123, "reasoning": "..." }
              ]
            }
            Use Indian Rupee (₹) context. Return ONLY the JSON.`;
        } else if (type === 'fuel-coach') {
            systemPrompt = `You are an expert vehicle maintenance and fuel efficiency coach. 
            Analyze the provided fuel entries and vehicle data to give 3-4 actionable coaching tips to improve mileage or reduce costs.
            Be concise and practical. Use Indian Rupee (₹) and Kilometers (km).`;
            userPrompt = `Context: ${body.context}\n\n${userPrompt}`;
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid type parameter' }) };
        }

        // Gemini API Endpoint (v1beta or v1)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_KEY}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser Input: ${userPrompt}` }]
                }]
            })
        });

        const data = await res.json();
        
        // Extract text from Gemini response structure
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // If budget, try to parse JSON from the text
        if (type === 'budget') {
            try {
                // Clean up markdown code blocks if present
                const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify(parsed)
                };
            } catch (err) {
                console.error('Failed to parse Gemini JSON:', text);
                return { statusCode: 500, body: JSON.stringify({ error: 'Failed to parse AI response', raw: text }) };
            }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ reply: text })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}
