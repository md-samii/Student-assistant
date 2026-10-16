import fs from 'node:fs';
import { pdf } from 'pdf-to-img';

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error('Usage: npx tsx test-ocr-render.ts "<path-to-pdf>"');
  process.exit(1);
}

const buffer = fs.readFileSync(pdfPath);
const document = await pdf(buffer, { scale: 1.5 });

for await (const image of document) {
  fs.writeFileSync('ocr-test-page.png', image);
  console.log('Rendered first page to ocr-test-page.png');
  break;
}
