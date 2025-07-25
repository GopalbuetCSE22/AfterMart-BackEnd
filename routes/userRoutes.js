const express = require('express');
const router = express.Router();

const {
  registerUser,
  getUsersToVerify,
  verifyUser,
  getinfoUser,
  isverifiedUser
} = require('../controllers/userController.js');


router.post('/register', registerUser);

router.get('/showUsersToVerify', getUsersToVerify);

router.patch('/verifyUser/:id', verifyUser);

router.get('/info/:userId', getinfoUser);

router.get('/isVerified/:userId', isverifiedUser);
module.exports = router;
