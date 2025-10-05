const express = require("express");
const router = express.Router();
const RefundController = require("../controller/refundController");
const authCheck = require("../middleware/authentication");
const { adminOnly } = require("../middleware/authorization");

router.post("/request-refund", authCheck, RefundController.requestRefund);
router.post("/review/:refundId", authCheck, adminOnly, RefundController.reviewRefund);
router.get("/my-refunds", authCheck, RefundController.listRefunds);
router.get("/all-refunds", authCheck,adminOnly, RefundController.listRefunds);

module.exports = router;