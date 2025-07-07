const express = require('express');
const { purchaseController, getPurchaseId,  } = require('../controllers/purchaseController');
const router = express.Router();


// create a new purchase
//localhost:5000/api/purchase/21/2/1/Courier/Booked/550.00/Unpaid

// router.post('/:productId/:buyerid/:sellerid/:deliveryMode/:status/:totalPrice/:payment_status', purchaseController);
router.post('/:productId/:buyerid', purchaseController);

//localhost:5000/api/purchase/getPurchaseId/21
// get the purchase id by using the product id to create a new shippment
router.get('/getPurchaseId/:productId', getPurchaseId);
module.exports = router;