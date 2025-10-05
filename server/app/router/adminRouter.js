const express = require('express');
const AdminController = require('../controller/adminController');
const authCheck = require('../middleware/authentication');
const { adminOnly } = require('../middleware/authorization');
const router = express.Router();

router.get("/profile", authCheck, adminOnly, AdminController.getAdminProfile);
router.get('/dev-link-requests', authCheck, adminOnly, AdminController.getDevLinkRequests);
router.post('/dev-link-requests/:userId/approve', authCheck, adminOnly, AdminController.approveDevLinkRequest);
router.put("/approve-developer/:developerId", authCheck, adminOnly, AdminController.approveDeveloper);
router.put("/ban-user/:userId", authCheck, adminOnly, AdminController.banUser);
router.put("/unban-user/:userId", authCheck, adminOnly, AdminController.unbanUser);
router.put("/promote-to-developer/:userId", authCheck, adminOnly, AdminController.promoteToDeveloper);

module.exports = router;