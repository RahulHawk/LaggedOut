const express = require("express");
const router = express.Router();
const { saleController } = require("../controller/saleController");
const authCheck = require("../middleware/authentication");
const { adminOrDeveloper } = require("../middleware/authorization");

router.post("/", authCheck, adminOrDeveloper, saleController.createSale);
router.post("/activate/:saleId", authCheck, adminOrDeveloper, saleController.activateSale);
router.post("/deactivate/:saleId", authCheck, adminOrDeveloper, saleController.deactivateSale);
router.get("/active", saleController.getActiveSales);
router.get("/", authCheck, saleController.getAllSales);

module.exports = router;
