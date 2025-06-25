const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/statisticsController');

router.get('/summary', getPlatformStats);

module.exports = router;
