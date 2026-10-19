import prisma from '../config/prisma';
import pdf from 'pdf-parse';
import { downloadPublicDrivePdf } from './googleDriveService';


export class NoReadablePdfTextError extends Error {
    constructor() {
        super(
            'No readable text found in the PDF. It may be scanned or image-only.'
        );
        this.name = 'NoReadablePdfTextError';
    }
}


export interface ExtractedPdfText {
    text: string;
    pageCount: number;
}

export const extractPdfText = async (
    pdfBuffer: Buffer
): Promise<ExtractedPdfText> => {
    if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF file is empty.');
    }

    const result = await pdf(pdfBuffer);

    const text = result.text?.trim();

    if (!text) {
        throw new NoReadablePdfTextError();
    }

    return {
        text,
        pageCount: result.numpages,
    };
};


export const splitTextIntoChunks = (
    text: string,
    chunkSize = 1500,
    overlap = 200
): string[] => {
    if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
        throw new Error(
            'chunkSize must be positive, and overlap must be non-negative and smaller than chunkSize.'
        );
    }

    const normalizedText = text
        .replace(/\u0000/g, '') // Remove null characters that PostgreSQL cannot store
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (!normalizedText) return [];

    // Prefer paragraph and sentence boundaries instead of cutting blindly.
    const paragraphs = normalizedText
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    const chunks: string[] = [];
    let currentChunk = '';

    const addChunk = (value: string) => {
        const cleaned = value.trim();
        if (cleaned) chunks.push(cleaned);
    };

    for (const paragraph of paragraphs) {
        // Keep reasonably sized paragraphs intact.
        if (paragraph.length <= chunkSize) {
            const candidate = currentChunk
                ? `${currentChunk}\n\n${paragraph}`
                : paragraph;

            if (candidate.length <= chunkSize) {
                currentChunk = candidate;
            } else {
                addChunk(currentChunk);

                // Preserve some context from the preceding chunk.
                const tail = currentChunk.slice(-overlap).trim();
                currentChunk = tail
                    ? `${tail}\n\n${paragraph}`
                    : paragraph;

                if (currentChunk.length > chunkSize) {
                    addChunk(currentChunk);
                    currentChunk = '';
                }
            }

            continue;
        }

        // Flush the current chunk before processing a long paragraph.
        addChunk(currentChunk);
        currentChunk = '';

        // Split long paragraphs near sentence or word boundaries.
        let remaining = paragraph;

        while (remaining.length > chunkSize) {
            let cutAt = remaining.lastIndexOf('. ', chunkSize);

            if (cutAt < Math.floor(chunkSize * 0.5)) {
                cutAt = remaining.lastIndexOf(' ', chunkSize);
            }

            if (cutAt < Math.floor(chunkSize * 0.5)) {
                cutAt = chunkSize;
            } else if (remaining[cutAt] === '.') {
                cutAt += 1;
            }

            const piece = remaining.slice(0, cutAt).trim();
            addChunk(piece);

            const nextRemaining = remaining.slice(
                Math.max(0, cutAt - overlap)
            ).trim();

            // Guard against an infinite loop.
            if (nextRemaining.length >= remaining.length) {
                remaining = remaining.slice(chunkSize).trim();
            } else {
                remaining = nextRemaining;
            }
        }

        currentChunk = remaining;
    }

    addChunk(currentChunk);

    return chunks;
};



export const ingestPdfForResource = async (
    resourceId: string,
    pdfBuffer: Buffer
): Promise<{ pageCount: number; chunkCount: number }> => {
    // Verify that the resource exists before processing the PDF.
    const resource = await prisma.studyResource.findUnique({
        where: { id: resourceId },
        select: { id: true },
    });

    if (!resource) {
        throw new Error('Study resource not found.');
    }

    // Extract readable text and split it into searchable chunks.
    const { text, pageCount } = await extractPdfText(pdfBuffer);
    const chunks = splitTextIntoChunks(text);

    if (chunks.length === 0) {
        throw new Error('No searchable text was extracted from the PDF.');
    }

    // Replace previous chunks only after successful extraction.
    await prisma.$transaction(async (tx) => {
        await tx.resourceChunk.deleteMany({
            where: { resourceId },
        });

        await tx.resourceChunk.createMany({
            data: chunks.map((content, chunkIndex) => ({
                resourceId,
                chunkIndex,
                content,
            })),
        });
    });

    return {
        pageCount,
        chunkCount: chunks.length,
    };
};


export const ingestGoogleDriveResource = async (
    resourceId: string,
): Promise<{ pageCount: number; chunkCount: number }> => {
    const resource = await prisma.studyResource.findUnique({
        where: { id: resourceId },
        select: {
            id: true,
            title: true,
            type: true,
            driveUrl: true,
        },
    });

    if (!resource) {
        throw new Error('Study resource not found.');
    }

    if (resource.type !== 'PDF_NOTES') {
        throw new Error('Only PDF_NOTES resources can be ingested.');
    }

    const pdfBuffer = await downloadPublicDrivePdf(resource.driveUrl);

    const result = await ingestPdfForResource(resource.id, pdfBuffer);

    console.log(
        `Indexed "${resource.title}": ${result.pageCount} pages, ` +
        `${result.chunkCount} chunks.`,
    );

    return result;
};
