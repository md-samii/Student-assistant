
import fs from 'node:fs';
import path from 'node:path';
import pdf from 'pdf-parse';
import prisma from '../src/config/prisma';

const LOCAL_PDF =
    'C:\\SAMI\\VTU_CSE_Notes_2022\\Semester_6\\Cloud Computing\\BCS601-module-1-pdf.pdf';

const EXISTING_RESOURCE_ID =
    'c28941d8-f316-43c5-89de-31094a6f6a70';

function normalize(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function main() {
    if (!fs.existsSync(LOCAL_PDF)) {
        throw new Error(`Local PDF not found: ${LOCAL_PDF}`);
    }

    const localBuffer = fs.readFileSync(LOCAL_PDF);
    const localPdf = await pdf(localBuffer);
    const localText = normalize(localPdf.text ?? '');

    const existingChunks = await prisma.resourceChunk.findMany({
        where: { resourceId: EXISTING_RESOURCE_ID },
        orderBy: { chunkIndex: 'asc' },
        select: { content: true },
    });

    const existingText = normalize(
        existingChunks.map((chunk) => chunk.content).join(' '),
    );

    const resource = await prisma.studyResource.findUnique({
        where: { id: EXISTING_RESOURCE_ID },
        select: { title: true, driveUrl: true },
    });

    console.log('\n=== Cloud Computing Module 1 Comparison ===');
    console.log(`Local file: ${path.basename(LOCAL_PDF)}`);
    console.log(`Local PDF pages: ${localPdf.numpages}`);
    console.log(`Local extracted characters: ${localText.length}`);
    console.log(`Existing resource: ${resource?.title ?? 'Not found'}`);
    console.log(`Existing chunks: ${existingChunks.length}`);
    console.log(`Existing extracted characters: ${existingText.length}`);

    if (!localText || !existingText) {
        console.log(
            '\nRESULT: Cannot compare reliably because one text is empty.',
        );
    } else {
        const localStart = localText.slice(0, 500);
        const existingStart = existingText.slice(0, 500);

        console.log(
            `\nFirst 500 normalized characters match: ${localStart === existingStart
            }`,
        );

        const localWords = new Set(localText.split(' '));
        const existingWords = new Set(existingText.split(' '));
        let common = 0;

        for (const word of localWords) {
            if (existingWords.has(word)) common++;
        }

        const similarity =
            (2 * common) / (localWords.size + existingWords.size);

        console.log(
            `Unique-word overlap score: ${(similarity * 100).toFixed(2)}%`,
        );

        console.log('\nLocal PDF opening text:');
        console.log(localText.slice(0, 500));

        console.log('\nExisting chunks opening text:');
        console.log(existingText.slice(0, 500));

        console.log(
            '\nNote: word overlap is only a rough indicator, not proof that the PDFs are identical.',
        );
    }

    console.log('\nRead-only comparison completed.');
}

main()
    .catch((error) => {
        console.error('Comparison failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
