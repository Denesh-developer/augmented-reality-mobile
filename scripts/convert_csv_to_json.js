import fs from 'fs';
import { parseCSVToPhones } from './parseHelper.js';

const csvContent = fs.readFileSync('./scripts/phones.csv', 'utf-8');
const phones = parseCSVToPhones(csvContent);

console.log(`Parsed ${phones.length} smartphones successfully from CSV.`);

fs.writeFileSync('./src/data/phones.json', JSON.stringify(phones, null, 2), 'utf-8');
console.log('Saved to src/data/phones.json');
