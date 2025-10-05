const express = require('express');
const router = express.Router();
const authCheck = require('../middleware/authentication');
const ActivityController = require('../controller/activityController');

router.get("/", authCheck, ActivityController.getUserActivity);

module.exports = router;