const express = require("express");
const router = express.Router();
const AdminAnalyticsController = require("../controller/analyticsController");
const authCheck = require("../middleware/authentication");
const { adminOnly } = require("../middleware/authorization");

router.get("/overall", authCheck, adminOnly, AdminAnalyticsController.getOverallAnalytics);

module.exports = router;
