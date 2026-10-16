import { downloadPublicDrivePdf } from '../services/googleDriveService';

async function main() {
    const url =
        'https://drive.google.com/file/d/1_zZVHzATAEMpBeZfophJECS47mS4uCOX/view';

    const pdf = await downloadPublicDrivePdf(url);

    console.log('Service download successful.');
    console.log('Downloaded bytes:', pdf.length);
    console.log('PDF signature:', pdf.subarray(0, 5).toString('ascii'));
}

main().catch((error) => {
    console.error('Service download failed:', error.message);
    process.exitCode = 1;
});
