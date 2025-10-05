const express = require('express');
const PurchaseController = require('../controller/purchaseController');
const authCheck = require('../middleware/authentication');
const router = express.Router();

router.post("/create-order", authCheck, PurchaseController.createOrder);
router.post("/verify-payment", authCheck, PurchaseController.verifyPayment);
router.get("/history/:gameId", authCheck, PurchaseController.getPurchaseHistoryForGame);
router.get("/my-history", authCheck, PurchaseController.getMyPurchaseHistory);

module.exports = router;