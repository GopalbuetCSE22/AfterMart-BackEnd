
const express = require('express');
const router = express.Router();

const {
  registerDeliveryService,
  getDeliveryServicesToVerify,
  verifyDeliveryService,
  createDeliveryMan,
  showDeliveryManUnderCompanyId
} = require('../controllers/deliveryController');
const { route } = require('./userRoutes');

router.post('/register', registerDeliveryService);

router.get('/showDeliveryCompanyToVerify', getDeliveryServicesToVerify);

router.patch('/verifyDeliveryCompany/:id', verifyDeliveryService);

router.post("/createDelivaryman", createDeliveryMan);
router.get("/showallDeliveryman/:company_id", showDeliveryManUnderCompanyId);

module.exports = router;
