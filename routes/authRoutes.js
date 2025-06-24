
const express = require('express');
const router = express.Router();

const {
  userLogin,
  adminLogin,
  deliveryServiceLogin,
  deliveryManlogin
} = require('../controllers/authController');

router.post('/userlogin', userLogin);
router.post('/adminlogin', adminLogin);
router.post('/delivaryServicelogin', deliveryServiceLogin);
router.post("/deliveryManlogin", deliveryManlogin);
module.exports = router;
