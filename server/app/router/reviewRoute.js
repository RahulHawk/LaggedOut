const express = require("express");
const router = express.Router();
const ReviewController = require("../controller/reviewController");
const authCheck = require("../middleware/authentication"); 


router.post("/", authCheck, ReviewController.addReview);
router.put("/:reviewId", authCheck, ReviewController.updateReview);
router.delete("/:reviewId", authCheck, ReviewController.deleteReview);
router.get("/game/:gameId", ReviewController.getReviewsByGame);
router.get("/game/:gameId/user", authCheck, ReviewController.getUserReview);

module.exports = router;
