const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authentication");
const friendController = require("../controller/friendController");


router.post("/send-request", authCheck, friendController.sendFriendRequest);
router.post("/cancel-request", authCheck, friendController.cancelFriendRequest);
router.post("/accept-request", authCheck, friendController.acceptFriendRequest);
router.post("/reject-request", authCheck, friendController.rejectFriendRequest);
router.post("/unfriend", authCheck, friendController.unfriend);
router.post("/block", authCheck, friendController.blockUser);
router.post("/unblock", authCheck, friendController.unblockUser);
router.get("/all-requests", authCheck, friendController.getAllRequests);
router.get("/search", authCheck, friendController.searchUsers);

module.exports = router;