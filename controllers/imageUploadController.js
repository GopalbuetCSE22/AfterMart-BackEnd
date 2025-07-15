// const { google } = require('googleapis');
// const pool = require('../db/pool'); // Adjust the path as necessary
// const fs = require('fs');
// // Google Drive setup
// const auth = new google.auth.GoogleAuth({
//     keyFile: 'service-account.json',
//     scopes: ['https://www.googleapis.com/auth/drive']
// });

// const drive = google.drive({ version: 'v3', auth });


// async function uploadToDrive(filePath, fileName) {
//     const folderId = process.env.DRIVEFOLDERID; // Replace with your folder ID
//     const fileMetadata = { name: fileName, parents: [folderId] };
//     const media = {
//         mimeType: 'image/jpeg',
//         body: fs.createReadStream(filePath),
//     };

//     const file = await drive.files.create({
//         resource: fileMetadata,
//         media,
//         fields: 'id',
//     });

//     const fileId = file.data.id;

//     await drive.permissions.create({
//         fileId,
//         requestBody: {
//             role: 'reader',
//             type: 'anyone',
//         },
//     });

//     return `https://drive.google.com/uc?id=${fileId}`;
// }


// async function imageUploader(req, res) {
//     const file = req.file;
//     // const username = req.body.username || 'anonymous';
//     const userid = req.params.userid;

//     console.log(userid);


//     try {
//         const driveUrl = await uploadToDrive(file.path, file.originalname);

//         console.log(driveUrl);


//         await pool.query(
//             'Update "User" set profile_picture = $2 where user_id = $1',
//             [userid, driveUrl]
//         );

//         res.json({ message: 'Image uploaded successfully!', url: driveUrl });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Upload failed.');
//     }
// }
// async function getProfilePicLink(req, res) {
//     const userid = req.params.userid;
//     if (!userid) return res.status(400).json({ error: 'user ID is required' });

//     try {
//         const result = await pool.query('SELECT profile_picture FROM "User" WHERE user_id = $1', [userid]);
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error('getOwnProducts error:', error);
//         res.status(500).json({ error: 'Failed to fetch own products' });
//     }
// }
// module.exports = {
//     imageUploader,getProfilePicLink
// };




const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const pool = require('../db/pool');
require('dotenv').config();

// ImageKit credentials from environment variables or directly as strings
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY; // ⚠️ Never expose this on frontend
const IMAGEKIT_UPLOAD_URL = process.env.IMAGEKIT_UPLOAD_URL;

// Uploads a file to ImageKit and returns the file URL
async function uploadToImageKit(filePath, fileName) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('fileName', fileName);
    form.append('useUniqueFileName', 'true'); // To avoid overwriting
    form.append('folder', '/profile-pictures'); // Optional folder in ImageKit media library

    try {
        const response = await axios.post(IMAGEKIT_UPLOAD_URL, form, {
            auth: {
                username: IMAGEKIT_PRIVATE_KEY,
                password: '', // Must be blank
            },
            headers: form.getHeaders(),
        });

        return response.data.url;
    } catch (err) {
        console.error('ImageKit upload error:', err.response?.data || err.message);
        throw new Error('Image upload to ImageKit failed.');
    }
}

// Express route handler to upload and save profile picture
async function imageUploader(req, res) {
    const file = req.file;
    const userid = req.params.userid;

    if (!file || !userid) {
        return res.status(400).json({ error: 'User ID and image file are required.' });
    }

    try {
        const imageUrl = await uploadToImageKit(file.path, file.originalname);


        console.log('Image uploaded to ImageKit:', imageUrl);

        // Optional: delete temp file after upload
        fs.unlink(file.path, () => { });

        await pool.query(
            'UPDATE "User" SET profile_picture = $2 WHERE user_id = $1',
            [userid, imageUrl]
        );

        res.json({ message: 'Image uploaded successfully!', url: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Upload failed.');
    }
}

// Express route handler to fetch profile picture URL by user ID
async function getProfilePicLink(req, res) {
    const userid = req.params.userid;

    if (!userid) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const result = await pool.query(
            'SELECT profile_picture FROM "User" WHERE user_id = $1',
            [userid]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('getProfilePicLink error:', error);
        res.status(500).json({ error: 'Failed to fetch profile picture' });
    }
}


async function imageUploader_product(req, res) {
    const file = req.file;
    const productId = req.params.productId;

    console.log('Product ID:', productId);
    if (!file || !productId) {
        return res.status(400).json({ error: 'Product ID and image file are required.' });
    }

    try {
        const imageUrl = await uploadToImageKit(file.path, file.originalname);


        console.log('Image uploaded to ImageKit:', imageUrl);

        // Optional: delete temp file after upload
        fs.unlink(file.path, () => { });

        await pool.query(
            'INSERT INTO product_media (product_id , image) VALUES ($1, $2)',
            [productId, imageUrl]
        );

        res.json({ message: 'Image uploaded successfully!', url: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Upload failed.');
    }
}
module.exports = {
    imageUploader,
    getProfilePicLink,
    imageUploader_product
};
