// routes/imageUploadRoute.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
// Import the new imageUploader_register function
const { imageUploader, getProfilePicLink, imageUploader_product, imageUploader_register,imageUploader_message } = require('../controllers/imageUploadController');

// Configure Multer for disk storage. 'uploads/' is a temporary directory.
// Ensure this directory exists or is created by your application.
const upload = multer({ dest: 'uploads/' });



// Existing Express endpoints
router.post('/upload/:userid', upload.single('image'), imageUploader); // For dashboard profile pic upload
router.post('/uploadProduct/:productId', upload.single('image'), imageUploader_product); // For product image upload
router.get('/getProfilePic/:userid', getProfilePicLink); // To fetch profile pic URL
router.post('/uploadMessageMedia', upload.single('image'), imageUploader_message);

// NEW: Express endpoint for profile picture upload during user registration
// This route will receive the image file and proxy it to ImageKit.
// The 'image' field in upload.single('image') must match the FormData key used on the frontend.
router.post('/uploadRegisterPic', upload.single('image'), imageUploader_register);

module.exports = router;
