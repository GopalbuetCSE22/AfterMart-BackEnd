
const express = require('express');
const router = express.Router();

const { getUsersToVerify, verifyUser } = require('../controllers/adminController');

router.get('/showUsersToVerify', getUsersToVerify);
router.patch('/verifyUser/:id', verifyUser);

module.exports = router;
