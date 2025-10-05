const express = require('express');
const ProfileController = require('../controller/profileController');
const authCheck = require('../middleware/authentication');
const uploadWithErrorHandler = require('../middleware/uploadMiddleware'); 
const { adminOrDeveloper } = require("../middleware/authorization");
const passport = require("passport");
const router = express.Router();

router.get("/me", authCheck, ProfileController.getMyProfile);
router.get("/developer/me", authCheck, adminOrDeveloper, ProfileController.getMyDeveloperProfile);
router.get("/developer/analytics", authCheck,adminOrDeveloper, ProfileController.getDeveloperAnalytics);
router.get("/player/:id", authCheck, ProfileController.getPlayerProfile);
router.get("/developer/:developerId", authCheck, ProfileController.getDeveloperProfile);
router.patch("/update", authCheck, uploadWithErrorHandler, ProfileController.updateProfile);
router.post("/update-email", authCheck, ProfileController.updateEmail);
router.post("/update-password", authCheck, ProfileController.updatePassword);
router.get("/link/google", authCheck, passport.authorize("google", { scope: ["profile", "email"] }));
router.get("/link/google/callback", authCheck, passport.authorize("google", { failureRedirect: "/profile" }), ProfileController.linkGoogleAccount);

router.post("/follow/:developerId", authCheck, ProfileController.followDeveloper);
router.post("/unfollow/:developerId", authCheck, ProfileController.unfollowDeveloper);
router.get("/developers", authCheck, ProfileController.getAllDevelopers);

router.get("/followers/:developerId", authCheck, adminOrDeveloper, ProfileController.getFollowers);

module.exports = router;