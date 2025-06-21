// server.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const { imageUploader } = require('../controllers/imageUploadController');
// const { uploadToDriveFromBuffer } = require('../controllers/imageUploadController');
const upload = multer({ dest: 'uploads/' });
// Use memory storage instead of disk storage
// const upload = multer({ storage: multer.memoryStorage() });

// Express endpoint
router.post('/upload/:userid', upload.single('image'), imageUploader);
// router.post('/upload/:userid', upload.single('image'), uploadToDriveFromBuffer);

module.exports = router;