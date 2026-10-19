
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../src/config/prisma';
import { ingestGoogleDriveResource } from '../src/services/pdfIngestionService';

const ROOT_FOLDER_ID = '1Hig9k35LWbikvi9MFxC1a5ENEhiG0enC';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DRY_RUN = false;

type DriveFile = {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
};

async function main() {
    const credentials = JSON.parse(
        fs.readFileSync(
            path.resolve('credentials/google-oauth-client.json'),
            'utf8',
        ),
    );
    const tokens = JSON.parse(
        fs.readFileSync(
            path.resolve('credentials/google-drive-token.json'),
            'utf8',
        ),
    );

    const { client_id, client_secret, redirect_uris } =
        credentials.installed ?? credentials.web ?? {};

    const auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris?.[0],
    );
    auth.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth });
    const queue = [ROOT_FOLDER_ID];
    const files: DriveFile[] = [];

    while (queue.length > 0) {
        const parentId = queue.shift()!;
        let pageToken: string | undefined;

        do {
            const response = await drive.files.list({
                q: `'${parentId}' in parents and trashed = false`,
                pageSize: 1000,
                pageToken,
                fields: 'nextPageToken,files(id,name,mimeType,size)',
            });

            for (const file of response.data.files ?? []) {
                if (!file.id || !file.name || !file.mimeType) continue;

                if (file.mimeType === FOLDER_MIME) {
                    queue.push(file.id);
                } else if (
                    file.mimeType === 'application/pdf' ||
                    file.name.toLowerCase().endsWith('.pdf')
                ) {
                    files.push({
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType,
                        size: file.size ?? undefined,
                    });
                }
            }

            pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);
    }

    const subjects = await prisma.subject.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            resources: {
                select: {
                    id: true,
                    title: true,
                    moduleNumber: true,
                    type: true,
                    driveUrl: true,
                    _count: { select: { chunks: true } },
                },
            },
        },
    });

    const subjectMap = new Map(
        subjects.map((subject) => [subject.code.toUpperCase(), subject]),
    );

    const seen = new Set<string>();
    const candidates: Array<{
        file: DriveFile;
        subjectId: string;
        subjectCode: string;
        subjectName: string;
        moduleNumber: number;
        title: string;
        driveUrl: string;
    }> = [];

    const skipped: string[] = [];
    const invalid: string[] = [];
    const duplicate: string[] = [];

    for (const file of files) {
        const match = file.name.match(
            /^([A-Za-z0-9]+)-module-(\d+)-pdf\.pdf$/i,
        );

        if (!match) {
            invalid.push(file.name);
            continue;
        }

        const code = match[1].toUpperCase();
        const moduleNumber = Number(match[2]);
        const subject = subjectMap.get(code);

        if (!subject) {
            skipped.push(`${file.name}: subject ${code} not found`);
            continue;
        }

        const key = `${code}-MODULE-${moduleNumber}`;

        if (seen.has(key)) {
            duplicate.push(file.name);
            continue;
        }
        seen.add(key);


        const driveUrl = `https://drive.google.com/file/d/${file.id}/view`;

        const alreadyRegistered = subject.resources.some((resource) => {
            const match = resource.driveUrl.match(/\/file\/d\/([^/]+)/);
            return match?.[1] === file.id;
        });

        if (alreadyRegistered) {
            skipped.push(`${file.name}: already registered by Drive file ID`);
            continue;
        }


        candidates.push({
            file,
            subjectId: subject.id,
            subjectCode: code,
            subjectName: subject.name,
            moduleNumber,
            title: `${subject.name} - Module ${moduleNumber} Notes`,
            driveUrl,
        });
    }

    console.log('\n========== DRIVE NOTES IMPORT ==========');
    console.log(`PDFs discovered: ${files.length}`);
    console.log(`Import candidates: ${candidates.length}`);
    console.log(`Existing resources skipped: ${skipped.length}`);
    console.log(`Duplicate subject/module files: ${duplicate.length}`);
    console.log(`Invalid filenames: ${invalid.length}`);
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN — no database writes' : 'LIVE IMPORT'}`);

    console.log('\n--- Candidates ---');
    for (const candidate of candidates) {
        console.log(
            `${candidate.subjectCode} | ${candidate.subjectName} | ` +
            `Module ${candidate.moduleNumber} | ${candidate.file.name} | ` +
            `${candidate.file.id}`,
        );
    }

    console.log('\n--- Existing resources skipped ---');
    console.log(skipped.join('\n') || 'None');

    console.log('\n--- Duplicate files skipped ---');
    console.log(duplicate.join('\n') || 'None');

    console.log('\n--- Invalid filenames ---');
    console.log(invalid.join('\n') || 'None');

    if (DRY_RUN) {
        console.log('\nDRY RUN COMPLETE: database was not modified.');
        return;
    }



    let imported = 0;
    let indexed = 0;
    let registeredWithoutChunks = 0;
    const failures: string[] = [];

    const { downloadPublicDrivePdf } = await import(
        '../src/services/googleDriveService'
    );
    const { extractPdfText, splitTextIntoChunks, NoReadablePdfTextError } =
        await import('../src/services/pdfIngestionService');

    for (const candidate of candidates) {
        try {
            // Skip only if this exact Google Drive PDF is already registered.
            const existingResources = await prisma.studyResource.findMany({
                where: { subjectId: candidate.subjectId },
                select: { id: true, driveUrl: true },
            });

            const alreadyRegistered = existingResources.some((resource) => {
                const match = resource.driveUrl.match(/\/file\/d\/([^/]+)/);
                return match?.[1] === candidate.file.id;
            });

            if (alreadyRegistered) {
                skipped.push(
                    `${candidate.file.name}: already registered by Drive file ID`,
                );
                continue;
            }

            let chunks: string[] = [];
            let extractionNote = '';

            // Attempt normal text extraction. Do not use OCR.
            try {
                const buffer = await downloadPublicDrivePdf(candidate.driveUrl);
                const { text } = await extractPdfText(buffer);
                chunks = splitTextIntoChunks(text);

                if (chunks.length === 0) {
                    extractionNote = 'No searchable text; registered without chunks';
                }

            } catch (error) {
                if (error instanceof NoReadablePdfTextError) {
                    extractionNote = error.message;

                    console.log(
                        `NO TEXT ${candidate.file.name}: ${extractionNote}`,
                    );
                } else {
                    throw error;
                }
            }


            // Register the PDF even if extraction failed.
            // New resources and any extracted chunks are written atomically.
            const resource = await prisma.$transaction(async (tx) => {
                const created = await tx.studyResource.create({
                    data: {
                        title: candidate.title,
                        description:
                            `Imported from Google Drive: ${candidate.file.name}` +
                            (extractionNote
                                ? ` | Indexing note: ${extractionNote}`
                                : ''),
                        subjectId: candidate.subjectId,
                        moduleNumber: candidate.moduleNumber,
                        type: 'PDF_NOTES',
                        driveUrl: candidate.driveUrl,
                        fileSize: candidate.file.size ?? null,
                        uploadedBy: 'system-import',
                    },
                });

                if (chunks.length > 0) {
                    await tx.resourceChunk.createMany({
                        data: chunks.map((content, chunkIndex) => ({
                            resourceId: created.id,
                            chunkIndex,
                            content,
                        })),
                    });
                }

                return created;
            });

            imported++;

            if (chunks.length > 0) {
                indexed++;
                console.log(
                    `IMPORTED + INDEXED ${candidate.file.name}: ` +
                    `${chunks.length} chunks (resource ${resource.id})`,
                );
            } else {
                registeredWithoutChunks++;
                console.log(
                    `REGISTERED WITHOUT CHUNKS ${candidate.file.name}: ` +
                    `${extractionNote || 'No searchable text found'}`,
                );
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);

            failures.push(`${candidate.file.name}: ${message}`);
            console.error(`FAILED ${candidate.file.name}: ${message}`);
        }
    }

    console.log('\n========== IMPORT SUMMARY ==========');
    console.log(`New resources registered: ${imported}`);
    console.log(`Resources indexed with chunks: ${indexed}`);
    console.log(`Resources registered without chunks: ${registeredWithoutChunks}`);
    console.log(`Skipped: ${skipped.length}`);
    console.log(`Failed: ${failures.length}`);
    console.log(failures.join('\n') || 'No failures.');
}

main()
    .catch((error) => {
        console.error('Drive notes import failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
