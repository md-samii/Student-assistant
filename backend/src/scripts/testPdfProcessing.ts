import { downloadPublicDrivePdf } from '../services/googleDriveService';
import {
    extractPdfText,
    splitTextIntoChunks,
} from '../services/pdfIngestionService';

async function main() {
    const url =
        'https://drive.google.com/file/d/1_zZVHzATAEMpBeZfophJECS47mS4uCOX/view';

    console.log('Downloading Computer Networks Module 1...');
    const buffer = await downloadPublicDrivePdf(url);

    console.log('Downloaded bytes:', buffer.length);

    console.log('Extracting PDF text...');
    const extracted = await extractPdfText(buffer);

    const chunks = splitTextIntoChunks(extracted.text);

    console.log('Page count:', extracted.pageCount);
    console.log('Extracted characters:', extracted.text.length);
    console.log('Generated chunks:', chunks.length);
    console.log('First chunk preview:');
    console.log(chunks[0]?.slice(0, 300));

    if (chunks.length === 0) {
        throw new Error('No searchable chunks were generated.');
    }

    console.log('\nREAD-ONLY VALIDATION PASSED.');
    console.log('No database records or chunks were changed.');
}

main().catch((error) => {
    console.error(
        'PDF processing validation failed:',
        error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
});
