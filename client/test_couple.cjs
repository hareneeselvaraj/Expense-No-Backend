const axios = require('axios');

async function test() {
    try {
        // 1. Log in to get token (assuming test user exists, wait, do I have a test user?)
        // The user's db is expense.db. Let's create a new user or login.
        const registerRes = await axios.post('http://localhost:5202/api/auth/register', {
            name: 'TestUser',
            email: 'testuser_couple_' + Date.now() + '@example.com',
            password: 'Password123!'
        });
        const token = registerRes.data.token;
        console.log('Got token:', token);

        // 2. Call /couple/create
        const createRes = await axios.post('http://localhost:5202/api/couple/create', {
            inviteEmail: 'partner@example.com'
        }, {
            headers: { Authorization: 'Bearer ' + token }
        });

        console.log('Success:', createRes.data);
    } catch (e) {
        if (e.response) {
            console.error('Request failed with HTTP status:', e.response.status);
            console.error('Response body:', JSON.stringify(e.response.data, null, 2));
        } else {
            console.error('Network or other error:', e.message);
        }
    }
}

test();
