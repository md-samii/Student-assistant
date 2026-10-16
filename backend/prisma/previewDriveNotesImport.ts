
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../src/config/prisma';

const ROOT_FOLDER_ID = '1Hig9k35LWbikvi9MFxC1a5ENEhiG0enC';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

type DriveFile = {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
    parents?: string[];
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
                fields: 'nextPageToken,files(id,name,mimeType,webViewLink,parents)',
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
                        webViewLink: file.webViewLink ?? undefined,
                        parents: file.parents ?? undefined,
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
            semester: true,
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

    const seenModules = new Set<string>();
    const missingSubjects = new Map<string, number>();
    const existingModules: string[] = [];
    const duplicateFiles: string[] = [];
    const candidates: string[] = [];
    const invalidFiles: string[] = [];

    let recognized = 0;

    for (const file of files) {
        const match = file.name.match(
            /^([A-Za-z0-9]+)-module-(\d+)-pdf\.pdf$/i,
        );

        if (!match) {
            invalidFiles.push(file.name);
            continue;
        }

        recognized++;

        const code = match[1].toUpperCase();
        const moduleNumber = Number(match[2]);
        const subject = subjectMap.get(code);

        if (!subject) {
            missingSubjects.set(
                code,
                (missingSubjects.get(code) ?? 0) + 1,
            );
            continue;
        }

        const key = `${code}-MODULE-${moduleNumber}`;

        if (seenModules.has(key)) {
            duplicateFiles.push(file.name);
            continue;
        }
        seenModules.add(key);

        const existing = subject.resources.filter(
            (resource) => resource.moduleNumber === moduleNumber,
        );

        if (existing.length > 0) {
            existingModules.push(
                `${code} Module ${moduleNumber}: ` +
                existing.map(
                    (resource) =>
                        `${resource.title} [chunks=${resource._count.chunks}, id=${resource.id}]`,
                ).join('; '),
            );
            continue;
        }

        candidates.push(
            `${code} | ${subject.name} | Module ${moduleNumber} | ` +
            `Drive file: ${file.name} | ID: ${file.id}`,
        );
    }

    console.log('\n========== DRIVE IMPORT DRY RUN ==========');
    console.log(`PDFs discovered in Drive: ${files.length}`);
    console.log(`Recognized module PDFs: ${recognized}`);
    console.log(`Subjects in database: ${subjects.length}`);
    console.log(`Potential import candidates: ${candidates.length}`);
    console.log(`Modules with existing resources: ${existingModules.length}`);
    console.log(`Duplicate subject/module files: ${duplicateFiles.length}`);
    console.log(
        `PDFs with missing subject codes: ${[...missingSubjects.values()].reduce((sum, count) => sum + count, 0)
        }`,
    );
    console.log(`PDFs with unrecognized filenames: ${invalidFiles.length}`);

    console.log('\n--- Existing resources (will not be overwritten) ---');
    console.log(existingModules.join('\n') || 'None');

    console.log('\n--- Missing subject codes ---');
    console.log(
        [...missingSubjects]
            .map(([code, count]) => `${code}: ${count} PDFs`)
            .join('\n') || 'None',
    );

    console.log('\n--- Duplicate files ---');
    console.log(duplicateFiles.join('\n') || 'None');

    console.log('\n--- Unrecognized filenames ---');
    console.log(invalidFiles.join('\n') || 'None');

    console.log('\n--- Potential import candidates ---');
    console.log(candidates.join('\n') || 'None');

    console.log('\nDRY RUN ONLY: no database records or chunks were changed.');
}

main()
    .catch((error) => {
        console.error(
            'Drive import preview failed:',
            error.response?.data?.error ?? error,
        );
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
