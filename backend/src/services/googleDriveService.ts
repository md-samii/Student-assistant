
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';

const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25 MB

const extractDriveFileId = (shareUrl: string): string => {
    let url: URL;

    try {
        url = new URL(shareUrl);
    } catch {
        throw new Error('Invalid Google Drive URL.');
    }

    if (
        !['drive.google.com', 'docs.google.com'].includes(
            url.hostname.toLowerCase(),
        )
    ) {
        throw new Error('Only Google Drive links are supported.');
    }

    const match = url.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
    const fileId = match?.[1] || url.searchParams.get('id');

    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
        throw new Error('Could not extract the Google Drive file ID.');
    }

    if (
        url.hostname.toLowerCase() === 'docs.google.com' &&
        !url.pathname.includes('/file/d/')
    ) {
        throw new Error('Export native Google Docs to PDF before ingestion.');
    }

    return fileId;
};

const getAuthenticatedDrive = () => {
    const credentialsPath = path.resolve(
        'credentials/google-oauth-client.json',
    );
    const tokenPath = path.resolve(
        'credentials/google-drive-token.json',
    );

    if (!fs.existsSync(credentialsPath) || !fs.existsSync(tokenPath)) {
        throw new Error(
            'Google Drive OAuth credentials are missing from the backend credentials directory.',
        );
    }

    const credentials = JSON.parse(
        fs.readFileSync(credentialsPath, 'utf8'),
    );
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_id, client_secret, redirect_uris } =
        credentials.installed ?? credentials.web ?? {};

    if (!client_id || !client_secret) {
        throw new Error('Invalid Google OAuth client credentials.');
    }

    const auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris?.[0],
    );

    auth.setCredentials(tokens);

    return google.drive({ version: 'v3', auth });
};

export const downloadPublicDrivePdf = async (
    shareUrl: string,
): Promise<Buffer> => {
    const fileId = extractDriveFileId(shareUrl);
    const drive = getAuthenticatedDrive();

    const metadata = await drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size',
    });

    if (metadata.data.mimeType !== 'application/pdf') {
        throw new Error('The Google Drive file is not a PDF.');
    }

    const declaredSize = Number(metadata.data.size ?? 0);

    if (declaredSize > MAX_PDF_SIZE) {
        throw new Error('PDF exceeds the 25 MB ingestion limit.');
    }

    const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' },
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);

    if (buffer.length > MAX_PDF_SIZE) {
        throw new Error('PDF exceeds the 25 MB ingestion limit.');
    }

    if (
        buffer.length < 5 ||
        buffer.subarray(0, 5).toString('ascii') !== '%PDF-'
    ) {
        throw new Error(
            'Google Drive did not return a valid PDF file.',
        );
    }

    return buffer;
};
