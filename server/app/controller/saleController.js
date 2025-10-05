const Sale = require("../model/saleModel");
const Game = require("../model/gameModel");
const User = require("../model/userModel");
const sendNotification = require("../helper/sendNotification");


async function _activateSaleLogic(saleId) {
    const sale = await Sale.findById(saleId).populate("games.game");
    if (!sale) throw new Error("Sale not found");
    if (sale.isActive) throw new Error("Sale is already active");

    for (const g of sale.games) {
        const game = g.game;
        if (!game) continue;

        const price = Number(game.basePrice);
        const discount = Number(g.discount);

        if (isNaN(price) || isNaN(discount)) {
            console.warn(`Invalid price or discount for game ${game._id}, skipping...`);
            continue;
        }

        game.salePrice = Math.round(price - (price * discount / 100));
        game.onSale = true;
        await game.save();
    }

    sale.isActive = true;
    await sale.save();

    const allUsers = await User.find({ role: { $exists: true }, isBanned: false });
    const userIds = allUsers.map(u => u._id);

    await sendNotification({
        user: userIds,
        type: "sale",
        content: `🔥 Sale started: ${sale.title}. Discounts on selected games!`,
        meta: { saleId: sale._id }
    });

    console.log(`Successfully activated sale: ${sale.title}`);
}

async function _deactivateSaleLogic(saleId) {
    const sale = await Sale.findById(saleId).populate("games.game");
    if (!sale) throw new Error("Sale not found");
    if (!sale.isActive) throw new Error("Sale is already inactive");

    for (const g of sale.games) {
        const game = g.game;
        if (!game) continue;

        game.salePrice = undefined;
        game.onSale = false;
        await game.save();
    }

    sale.isActive = false;
    await sale.save();
    console.log(`Successfully deactivated sale: ${sale.title}`);
}

class SaleController {

    async createSale(req, res) {
        try {
            const { title, description, games, startDate, endDate } = req.body;
            const creator = req.user._id;

            // Role check (admin or developer)
            if (!req.user.role || !["admin", "developer"].includes(req.user.role.name.toLowerCase())) {
                return res.status(403).json({ message: "Not authorized to create sale" });
            }

            // Validate dates
            if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
                return res.status(400).json({ message: "Invalid start or end date" });
            }

            // Validate games array
            if (!Array.isArray(games) || games.length === 0) {
                return res.status(400).json({ message: "Sale must include at least one game" });
            }

            const sale = new Sale({
                title,
                description,
                games,
                startDate,
                endDate,
                createdBy: creator,
                isActive: false
            });

            await sale.save();

            res.status(201).json({ message: "Sale created successfully", sale });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Activate Sale ---
    async activateSale(req, res) {
        try {
            const { saleId } = req.params;
            
            await _activateSaleLogic(saleId);

            res.json({ message: "Sale activated successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    // --- Deactivate Sale ---
    async deactivateSale(req, res) {
        try {
            await _deactivateSaleLogic(req.params.saleId);
            res.json({ message: "Sale deactivated successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    // --- Get all active sales ---
    async getActiveSales(req, res) {
        try {
            const sales = await Sale.find({ isActive: true }).populate("games.game");
            res.json(sales);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // --- Get all sales ---
    async getAllSales(req, res) {
        try {
            console.log("--- DEBUGGING getAllSales ---");
            console.log("Searching for sales created by user ID:", req.user._id);
            const findQuery = { createdBy: req.user._id };
            const sales = await Sale.find(findQuery).populate("games.game");
            console.log(`Found ${sales.length} sales for this user.`);
            res.json(sales);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

const saleControllerInstance = new SaleController();

module.exports = {
    saleController: saleControllerInstance,
    _activateSaleLogic,
    _deactivateSaleLogic
};
