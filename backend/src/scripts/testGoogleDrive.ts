
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';

const credentialsPath = path.resolve(
    process.cwd(),
    'credentials',
    'google-oauth-client.json',
);

const tokenPath = path.resolve(
    process.cwd(),
    'credentials',
    'google-drive-token.json',
);

async function main() {
    const credentials = JSON.parse(
        fs.readFileSync(credentialsPath, 'utf8'),
    );
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_id, client_secret, redirect_uris } =
        credentials.installed ?? credentials.web ?? {};

    const auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris?.[0],
    );
    auth.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth });

    const folderId = '186fhfchK1QAg97LPoPHANmEWyOYdM8Ek';

    const response = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType,webViewLink',
    });

    console.log('Destination folder found:');
    console.log('Name:', response.data.name);
    console.log('ID:', response.data.id);
    console.log('Type:', response.data.mimeType);
}

main().catch((error) => {
    console.error(
        'Folder verification failed:',
        error.response?.data?.error ?? error.message,
    );
    process.exitCode = 1;
});
