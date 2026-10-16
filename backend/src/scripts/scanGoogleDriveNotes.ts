
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';

const rootFolderId = '1Hig9k35LWbikvi9MFxC1a5ENEhiG0enC';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

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

    let folders = 0;
    let pdfs = 0;
    let otherFiles = 0;
    const samples: string[] = [];
    const queue = [{ id: rootFolderId, name: 'VTU_CSE_Notes_2022' }];

    while (queue.length > 0) {
        const current = queue.shift()!;
        let pageToken: string | undefined;

        do {
            const response = await drive.files.list({
                q: `'${current.id}' in parents and trashed = false`,
                pageSize: 1000,
                pageToken,
                fields: 'nextPageToken,files(id,name,mimeType)',
            });

            for (const file of response.data.files ?? []) {
                const name = file.name ?? '(unnamed)';
                const fullPath = `${current.name}/${name}`;

                if (file.mimeType === FOLDER_MIME) {
                    folders++;
                    queue.push({ id: file.id!, name: fullPath });
                } else if (
                    file.mimeType === 'application/pdf' ||
                    name.toLowerCase().endsWith('.pdf')
                ) {
                    pdfs++;
                    if (samples.length < 10) samples.push(fullPath);
                } else {
                    otherFiles++;
                }
            }

            pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);
    }

    console.log('Recursive Drive scan complete (read-only).');
    console.log({ folders, pdfs, otherFiles });
    console.log('Sample PDFs:');
    console.log(samples);
}

main().catch((error) => {
    console.error(
        'Drive scan failed:',
        error.response?.data?.error ?? error.message,
    );
    process.exitCode = 1;
});
