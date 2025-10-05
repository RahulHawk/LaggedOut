// In your achievementConditions.js file

const Purchase = require("../model/purchaseModel");
const Inventory = require("../model/inventoryModel");
const User = require("../model/userModel");
const Achievement = require("../model/achievementModel");
const assignAchievement = require("./assignAchievement");

// Define all achievement conditions in a single, manageable array.
// Each object has the condition name and a 'predicate' function that returns true or false.
const achievementChecks = [
    // Purchase-based
    { condition: "first_purchase", predicate: (user, purchases) => purchases.length === 1 },
    { condition: "buy_5_games", predicate: (user, purchases) => purchases.length >= 5 },
    { condition: "buy_10_games", predicate: (user, purchases) => purchases.length >= 10 },
    { condition: "dlc_purchase", predicate: (user, purchases) => purchases.some(p => p.dlc) },
    {
        condition: "buy_3_genres",
        predicate: (user, purchases) => {
            // Ensure games are populated for this check
            const genres = new Set(purchases.map(p => p.game?.genre?.toString()).filter(Boolean));
            return genres.size >= 3;
        }
    },
    {
        condition: "3_purchases_week",
        predicate: (user, purchases) => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const recentPurchases = purchases.filter(p => p.createdAt >= oneWeekAgo);
            return recentPurchases.length >= 3;
        }
    },

    // Inventory-based
    { condition: "avatars_5", predicate: (user, purchases, inventory) => inventory?.avatars.length >= 5 },
    { condition: "avatars_10", predicate: (user, purchases, inventory) => inventory?.avatars.length >= 10 },

    // User Profile & Social
    { condition: "first_wishlist", predicate: (user) => user.wishlist.length >= 1 },
    { condition: "wishlist_5", predicate: (user) => user.wishlist.length >= 5 },
    { condition: "wishlist_10", predicate: (user) => user.wishlist.length >= 10 },
    { condition: "profile_bio", predicate: (user) => user.profile?.bio?.length > 0 },
    { condition: "profile_pic", predicate: (user) => user.profile?.profilePic && user.profile.profilePic !== "/default-avatar.png" },
    { condition: "friends_5", predicate: (user) => user.friends.length >= 5 },
    { condition: "friends_10", predicate: (user) => user.friends.length >= 10 },
    { condition: "favorite_1", predicate: (user) => user.favorites.length >= 1 },
    { condition: "favorite_5", predicate: (user) => user.favorites.length >= 5 },
    { condition: "library_5", predicate: (user) => user.library.length >= 5 },
    { condition: "library_10", predicate: (user) => user.library.length >= 10 },
];

/**
 * A single, efficient function to check all achievements for a user.
 * It fetches all necessary data once, then iterates through the checks.
 * @param {string} userId - The ID of the user to check.
 */
const checkAllUserAchievements = async (userId) => {
    try {
        // 1. Fetch all necessary data in parallel to be efficient
        const [user, purchases, inventory] = await Promise.all([
            User.findById(userId),
            Purchase.find({ user: userId }).populate('game', 'genre'), // Populate genre for the genre check
            Inventory.findOne({ user: userId })
        ]);

        if (!user) {
            console.error("Achievement Check: User not found.");
            return;
        }

        // 2. Iterate through every achievement check
        for (const check of achievementChecks) {
            // 3. Run the predicate function with the pre-fetched data
            if (check.predicate(user, purchases, inventory)) {
                // 4. If the condition is met, find and assign the achievement
                const ach = await Achievement.findOne({ condition: check.condition });
                if (ach) {
                    // This logic is now in one place!
                    await assignAchievement(userId, ach._id);
                }
            }
        }
    } catch (error) {
        console.error("Error in checkAllUserAchievements:", error);
    }
};

// Export the single, powerful function
module.exports = checkAllUserAchievements;