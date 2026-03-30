const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const code = fs.readFileSync('src/components/AI/AIChat.jsx', 'utf8');
const parser = acorn.Parser.extend(jsx());

let ast;
try {
    ast = parser.parse(code, { sourceType: 'module', ecmaVersion: 2020 });
} catch (e) {
    console.error('Parse error:', e);
    process.exit(1);
}

const walk = require('acorn-walk');
let scopes = [new Set()];
const globals = new Set();

// We need a proper scope tracker.
// Actually, it's easier to just print all lines containing the literal character 'i' that are longer than 100 characters.
const lines = code.split('\n');
lines.forEach((line, idx) => {
    if (line.length > 50 && /\bi\b/.test(line)) {
        console.log(`Line ${idx + 1} (${line.length} chars): ${line.trim()}`);
    }
});
