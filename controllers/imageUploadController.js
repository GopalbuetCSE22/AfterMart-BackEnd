const { google } = require('googleapis');
const pool = require('../db/pool'); // Adjust the path as necessary
const fs = require('fs');
// Google Drive setup
const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });


async function uploadToDrive(filePath, fileName) {
    const folderId = process.env.DRIVEFOLDERID; // Replace with your folder ID
    const fileMetadata = { name: fileName, parents: [folderId] };
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id',
    });

    const fileId = file.data.id;

    await drive.permissions.create({
        fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return `https://drive.google.com/uc?id=${fileId}`;
}


async function imageUploader(req, res) {
    const file = req.file;
    // const username = req.body.username || 'anonymous';
    const userid = req.params.userid;

    console.log(userid);
    

    try {
        const driveUrl = await uploadToDrive(file.path, file.originalname);

        console.log(driveUrl);


        await pool.query(
            'Update "User" set profile_picture = $2 where user_id = $1',
            [userid, driveUrl]
        );

        res.json({ message: 'Image uploaded successfully!', url: driveUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Upload failed.');
    }
}

module.exports = {
    imageUploader
};