const express = require('express');
const CartController = require('../controller/cartController');
const authCheck = require('../middleware/authentication');
const router = express.Router();

router.post("/add", authCheck, CartController.addToCart);
router.delete("/remove/:itemId", authCheck, CartController.removeFromCart);
router.get("/", authCheck, CartController.getCart);
router.post("/create-order", authCheck, CartController.createCartOrder);
router.post("/verify-payment", authCheck, CartController.verifyCartPayment);

module.exports = router;