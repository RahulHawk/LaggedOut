const Inventory = require("../model/inventoryModel");
const UserAchievement = require("../model/userAchievementModel");
const Achievement = require("../model/achievementModel");
const Activity = require("../model/activityModel");

async function assignAchievement(userId, achievementId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const alreadyEarned = await UserAchievement.findOne({ user: userId, achievement: achievementId }).session(session);
        if (alreadyEarned) {
            await session.abortTransaction();
            return;
        }

        const achievement = await Achievement.findById(achievementId).session(session);
        if (!achievement) {
            await session.abortTransaction();
            session.endSession();
            return;
        }
        await UserAchievement.create([{ user: userId, achievement: achievementId }], { session });

        if (achievement.badge) {
            await Inventory.updateOne(
                { user: userId },
                { $addToSet: { badges: achievement.badge } },
                { upsert: true, session }
            );
        }

        await Activity.create([{
            user: userId,
            type: "achievement",
            details: {
                achievementId: achievement._id,
                achievementName: achievement.name,
                badgeId: achievement.badge || null
            }
        }], { session });

        await session.commitTransaction();
        console.log(`Achievement '${achievement.name}' assigned to user ${userId}`);

    } catch (err) {
        await session.abortTransaction();
        console.error("Assign Achievement Error (Transaction Rolled Back):", err);
        throw err;
    } finally {
        session.endSession();
    }
}

module.exports = assignAchievement;