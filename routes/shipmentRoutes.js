const express = require('express');
const {makeshipment} = require('../controllers/shipmentController');
const router = express.Router();


// create a new shipment using the purchase id
router.post('/makeshipment/:purchaseid', makeshipment);
module.exports = router;