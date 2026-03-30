const axios = require('axios');

async function test() {
    try {
        const registerRes = await axios.post('http://localhost:5202/api/auth/register', {
            name: 'TestUser2',
            email: 'testuser2_couple_' + Date.now() + '@example.com',
            password: 'Password123!'
        });
        const token = registerRes.data.token;
        const headers = { Authorization: 'Bearer ' + token };

        // 1. Create Couple
        console.log('Creating first couple...');
        await axios.post('http://localhost:5202/api/couple/create', { inviteEmail: 'partner1@example.com' }, { headers });

        // 2. Leave Couple
        console.log('Leaving first couple...');
        await axios.delete('http://localhost:5202/api/couple/leave', { headers });

        // 3. Create Couple AGAIN
        console.log('Creating second couple...');
        await axios.post('http://localhost:5202/api/couple/create', { inviteEmail: 'partner2@example.com' }, { headers });

        console.log('Success completely!');
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
