const express = require('express');
const router = express.Router();

const {
  registerUser,
  getUsersToVerify,
  verifyUser,
} = require('../controllers/userController.js');


router.post('/register', registerUser);

router.get('/showUsersToVerify', getUsersToVerify);

router.patch('/verifyUser/:id', verifyUser);

module.exports = router;
