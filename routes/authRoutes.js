
const express = require('express');
const router = express.Router();

const {
  userLogin,
  adminLogin,
  deliveryServiceLogin,
} = require('../controllers/authController');

router.post('/userlogin', userLogin);
router.post('/adminlogin', adminLogin);
router.post('/delivaryServicelogin', deliveryServiceLogin);

module.exports = router;
