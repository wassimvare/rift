import { existsSync, readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.ok(existsSync('dist/index.html'), 'dist/index.html manquant');
const html = readFileSync('dist/index.html', 'utf8');
assert.ok(!html.includes('/src/main.ts'), 'Vite n’a pas remplacé l’entrée TypeScript');
assert.ok(readdirSync('dist/assets').some((name) => name.endsWith('.js')), 'bundle JS manquant');
console.log('Smoke build Vite: OK');
