
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';

const CREDENTIALS_PATH = path.resolve(
    process.cwd(),
    'credentials',
    'google-oauth-client.json',
);

const TOKEN_PATH = path.resolve(
    process.cwd(),
    'credentials',
    'google-drive-token.json',
);

async function main() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Credentials file not found: ${CREDENTIALS_PATH}`);
    }

    await authenticate({
        keyfilePath: CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const credentials = JSON.parse(
        fs.readFileSync(CREDENTIALS_PATH, 'utf8'),
    );

    const { client_id, client_secret, redirect_uris } =
        credentials.installed ?? credentials.web ?? {};

    const auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris?.[0],
    );

    if (!fs.existsSync(TOKEN_PATH)) {
        throw new Error(
            'Token file not found. Complete Google Drive authorization first.',
        );
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    auth.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.about.get({
        fields: 'user(emailAddress)',
    });

    console.log('Google Drive authorization successful.');
    console.log('Authorized account:', response.data.user?.emailAddress);
    console.log('Token saved locally:', TOKEN_PATH);
}

main().catch((error) => {
    console.error('Google Drive authorization failed:', error.message);
    process.exitCode = 1;
});
