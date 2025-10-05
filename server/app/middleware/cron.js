const cron = require("node-cron");
const Sale = require("../model/saleModel");
// FIX: Import both helper functions
const { _activateSaleLogic, _deactivateSaleLogic } = require('../controller/saleController');
const mongoose = require("mongoose");

// ... (mongoose connection logic)

cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
        // --- Activate sales that are within start and end time and not active ---
        const salesToActivate = await Sale.find({
            startDate: { $lte: now },
            endDate: { $gte: now },
            isActive: false
        });

        for (const sale of salesToActivate) {
            console.log(`Activating sale via cron: ${sale.title}`);
            // FIX: Call the helper function directly with the ID
            await _activateSaleLogic(sale._id);
        }

        // --- Deactivate sales that have ended ---
        const salesToDeactivate = await Sale.find({
            endDate: { $lte: now },
            isActive: true
        });

        for (const sale of salesToDeactivate) {
            console.log(`Deactivating sale via cron: ${sale.title}`);
            // FIX: Call the helper function directly with the ID
            await _deactivateSaleLogic(sale._id);
        }

    } catch (err) {
        console.error("Error running sale cron job:", err.message);
    }
});

console.log("Sale cron job started: checking every minute...");