// controllers/imageUploadController.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const pool = require('../db/pool'); // Assuming this path is correct
require('dotenv').config(); // Load environment variables

// ImageKit credentials from environment variables (NEVER hardcode private key in frontend)
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_UPLOAD_URL = process.env.IMAGEKIT_UPLOAD_URL || 'https://upload.imagekit.io/api/v1/files/upload'; // Provide a fallback URL

// Ensure ImageKit credentials are available
if (!IMAGEKIT_PRIVATE_KEY) {
    console.error("ERROR: IMAGEKIT_PRIVATE_KEY is not defined in environment variables.");
}

// Helper function to upload a file to ImageKit and return the file URL
async function uploadToImageKit(filePath, fileName, folder = '/') {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('fileName', fileName);
    form.append('useUniqueFileName', 'true');
    form.append('folder', folder);

    try {
        const response = await axios.post(IMAGEKIT_UPLOAD_URL, form, {
            auth: {
                username: IMAGEKIT_PRIVATE_KEY,
                password: '',
            },
            headers: form.getHeaders(),
        });

        return response.data.url;
    } catch (err) {
        console.error('ImageKit upload error:', err.response?.data || err.message);
        throw new Error('Image upload to ImageKit failed. Please check backend logs.');
    }
}

// Express route handler to upload and save profile picture (for dashboard)
async function imageUploader(req, res) {
    const file = req.file;
    const userid = req.params.userid;

    if (!file || !userid) {
        return res.status(400).json({ error: 'User ID and image file are required.' });
    }

    try {
        const imageUrl = await uploadToImageKit(file.path, file.originalname, '/profile-pictures');

        // Delete temp file after upload
        fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });

        // Update the user's profile picture in the database
        await pool.query(
            'UPDATE "User" SET profile_picture = $2 WHERE user_id = $1',
            [userid, imageUrl]
        );

        res.json({ message: 'Image uploaded successfully!', url: imageUrl });
    } catch (error) {
        console.error('imageUploader error:', error);
        res.status(500).json({ error: error.message || 'Upload failed.' });
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

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('getProfilePicLink error:', error);
        res.status(500).json({ error: 'Failed to fetch profile picture.' });
    }
}

async function imageUploader_product(req, res) {
    const file = req.file;
    const productId = req.params.productId;

    if (!file || !productId) {
        return res.status(400).json({ error: 'Product ID and image file are required.' });
    }

    try {
        const imageUrl = await uploadToImageKit(file.path, file.originalname, '/product-images');

        // Delete temp file
        fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });

        // Check if product exists first
        const productCheck = await pool.query('SELECT product_id FROM product WHERE product_id = $1', [productId]);
        
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const result = await pool.query(
            'INSERT INTO product_media (product_id, image) VALUES ($1, $2) RETURNING *',
            [productId, imageUrl]
        );
        
        res.json({ 
            message: 'Product image uploaded successfully!', 
            url: imageUrl,
            dbRecord: result.rows[0]
        });
        
    } catch (error) {
        console.error('imageUploader_product error:', error);
        res.status(500).json({ error: error.message || 'Product image upload failed.' });
    }
}

// Express route handler for uploading profile pictures during user registration
async function imageUploader_register(req, res) {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Image file is required for registration upload.' });
    }

    try {
        const imageUrl = await uploadToImageKit(file.path, file.originalname, '/registration-profile-pictures');

        // Delete temp file after upload
        fs.unlink(file.path, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });

        res.json({ message: 'Image uploaded successfully to ImageKit!', url: imageUrl });
    } catch (error) {
        console.error('imageUploader_register error:', error);
        res.status(500).json({ error: error.message || 'Image upload for registration failed.' });
    }
}

module.exports = {
    imageUploader,
    getProfilePicLink,
    imageUploader_product,
    imageUploader_register
};