const fs = require('fs');

// just print all lines containing the literal word 'i'
const code = fs.readFileSync('src/components/AI/AIChat.jsx', 'utf8');
const lines = code.split('\n');
lines.forEach((line, idx) => {
    // word boundary regex
    if (/\bi\b/.test(line)) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
