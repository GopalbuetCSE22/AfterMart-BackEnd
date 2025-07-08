const express = require('express');
const router = express.Router();

const {
  registerUser,
  getUsersToVerify,
  verifyUser,
  getinfoUser
} = require('../controllers/userController.js');


router.post('/register', registerUser);

router.get('/showUsersToVerify', getUsersToVerify);

router.patch('/verifyUser/:id', verifyUser);

router.get('/info/:userId', getinfoUser);

module.exports = router;
