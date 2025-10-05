const express = require('express');
const HomeController = require('../controller/homeController');
const authCheck = require('../middleware/authentication');
const router = express.Router();

router.post("/add-favorite", authCheck, HomeController.addFavorite);
router.delete("/remove-favorite/:gameId", authCheck, HomeController.removeFavorite);
router.get("/favorites", authCheck, HomeController.getFavorites);
router.get("/library", authCheck, HomeController.getLibrary);
router.post("/add-to-wishlist", authCheck, HomeController.addToWishlist);
router.delete("/remove-from-wishlist/:gameId", authCheck, HomeController.removeFromWishlist);
router.get("/wishlist", authCheck, HomeController.getWishlist);

module.exports = router;