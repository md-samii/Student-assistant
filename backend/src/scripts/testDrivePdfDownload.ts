import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const credentials = JSON.parse(
    fs.readFileSync(path.resolve('credentials/google-oauth-client.json'), 'utf8'),
  );

  const tokens = JSON.parse(
    fs.readFileSync(path.resolve('credentials/google-drive-token.json'), 'utf8'),
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
  const fileId = '1_zZVHzATAEMpBeZfophJECS47mS4uCOX';

  const metadata = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,size',
  });

  console.log('File metadata:', metadata.data);

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' },
  );

  const buffer = Buffer.from(response.data as ArrayBuffer);

  console.log('Downloaded bytes:', buffer.length);
  console.log('PDF signature:', buffer.subarray(0, 5).toString('ascii'));

  if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('The downloaded file is not a valid PDF.');
  }

  console.log('Authenticated PDF download test passed.');
}

main().catch((error) => {
  console.error(
    'PDF download test failed:',
    error.response?.data?.error ?? error.message,
  );
  process.exitCode = 1;
});
