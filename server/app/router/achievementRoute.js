const express = require('express');
const AchievementController = require('../controller/achievementController');
const authCheck = require('../middleware/authentication');
const { adminOnly } = require('../middleware/authorization');
const uploadWithErrorHandler = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get("/inventory", authCheck, AchievementController.getInventory);
router.get("/achievements", authCheck, adminOnly, AchievementController.listAchievements);
router.get("/all&my-achievements", authCheck, AchievementController.getAllAndMyAchievements);
router.post("/badges", authCheck, adminOnly, uploadWithErrorHandler, AchievementController.createBadge);
router.post("/achievements", authCheck, adminOnly, AchievementController.createAchievement);

module.exports = router;