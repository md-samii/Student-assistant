
import prisma from '../config/prisma';
import { ingestGoogleDriveResource } from '../services/pdfIngestionService';

const main = async () => {
    const resourceId = process.argv[2];

    if (!resourceId) {
        throw new Error(
            'Usage: npm run ingest:drive -- <resource-id>',
        );
    }

    const result = await ingestGoogleDriveResource(resourceId);

    console.log('Google Drive PDF ingestion completed:', result);
};

main()
    .catch((error: unknown) => {
        console.error(
            'Google Drive PDF ingestion failed:',
            error instanceof Error ? error.message : error,
        );
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
