import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../src/templates');
const dest = path.resolve(__dirname, '../templates');

await fs.remove(dest);
await fs.copy(src, dest);

console.log(`Templates copiados a ${path.relative(process.cwd(), dest)}`);
