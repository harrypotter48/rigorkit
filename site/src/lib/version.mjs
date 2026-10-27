import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../../../VERSION', import.meta.url));
if (!fs.existsSync(file)) throw new Error('Missing VERSION file at the repository root.');
export const VERSION = fs.readFileSync(file, 'utf8').trim();
