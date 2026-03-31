// Netlify Function: Price Feed Proxy
// GET /.netlify/functions/price-feed?ticker=TCS.NS&type=stock
export async function handler(event) {
    const { ticker, type = 'stock' } = event.queryStringParameters || {};
    if (!ticker) return { statusCode: 400, body: JSON.stringify({ error: 'ticker required' }) };

    try {
        let url, price, currency = 'INR';

        if (type === 'mf') {
            url = `https://api.mfapi.in/mf/${ticker}/latest`;
            const res = await fetch(url);
            const data = await res.json();
            price = parseFloat(data?.data?.[0]?.nav || 0);
        } else {
            url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
            const res = await fetch(url);
            const data = await res.json();
            price = data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
            currency = data?.chart?.result?.[0]?.meta?.currency || 'INR';
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ ticker, price, currency, timestamp: new Date().toISOString() })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}
