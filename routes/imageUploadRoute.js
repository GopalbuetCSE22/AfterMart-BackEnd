// server.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const { imageUploader } = require('../controllers/imageUploadController');
const upload = multer({ dest: 'uploads/' });

// Express endpoint
router.post('/upload/:userid', upload.single('image'), imageUploader);

module.exports = router;