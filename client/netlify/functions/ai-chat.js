// Netlify Function: AI Chat Proxy (Groq API)
// POST /.netlify/functions/ai-chat
export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'GROQ_API_KEY not configured' }) };
    }

    try {
        const { message, history = [], context = '' } = JSON.parse(event.body || '{}');

        const systemPrompt = `You are a helpful financial assistant for an Expense Tracker app. 
You help users understand their spending, budgets, investments, and financial health.
${context ? `\nUser's financial context:\n${context}` : ''}
Be concise, practical, and use Indian Rupee (₹) formatting.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
        ];

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                max_tokens: 2048,
                temperature: 0.7
            })
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ reply, role: 'assistant' })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}
