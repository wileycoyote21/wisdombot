// utils/memory.js
import fs from 'fs';
const MEMORY_FILE = 'memory.json';

export function readMemory() {
  try {
    const data = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { history: [] };
  }
}

export function writeMemory(updatedMemory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(updatedMemory, null, 2));
}
