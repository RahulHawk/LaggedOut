const express = require("express");
const router = express.Router();
const NotificationController = require("../controller/notificationController");
const authCheck = require("../middleware/authentication");
const { adminOnly } = require("../middleware/authorization");


router.post("/", authCheck, adminOnly, NotificationController.createNotification);
router.get("/", authCheck, NotificationController.getUserNotifications);
router.put("/:notificationId/read", authCheck, NotificationController.markAsRead);
router.put("/read-all", authCheck, NotificationController.markAllAsRead);
router.delete("/delete-all", authCheck, NotificationController.deleteAllNotifications);
router.delete("/:notificationId", authCheck, NotificationController.deleteNotification);

module.exports = router;
