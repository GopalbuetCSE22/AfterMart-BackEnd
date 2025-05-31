
const express = require('express');
const router = express.Router();

const {
  registerDeliveryService,
  getDeliveryServicesToVerify,
  verifyDeliveryService,
} = require('../controllers/deliveryController');

router.post('/register', registerDeliveryService);

router.get('/showDeliveryCompanyToVerify', getDeliveryServicesToVerify);

router.patch('/verifyDeliveryCompany/:id', verifyDeliveryService);

module.exports = router;
