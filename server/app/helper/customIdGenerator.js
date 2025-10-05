const Counter = require("../model/counterModel");
const User = require("../model/userModel"); // We need the User model to check for existing IDs

async function generateCustomId(role) {
    // 1. Determine the correct counter and range for the given role.
    let counterId, min, max;

    if (role === "admin") {
        counterId = "adminUserId";
        min = 9000000000;
        max = 9000000009;
    } else if (role === "developer") {
        counterId = "developerUserId";
        min = 9000000012;
        max = 9000001199;
    } else { // Default to player
        counterId = "playerUserId";
        min = 9000001200;
        max = Number.MAX_SAFE_INTEGER;
    }

    // 2. Atomically find and increment the sequence for the specific role's counter.
    let counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true }
    );

    // 3. If no counter existed, we need to create one.
    if (!counter) {
        // Look for the highest existing user ID within the role's range.
        const lastUserInDb = await User.findOne({
            userId: { $gte: min, $lte: max }
        }).sort({ userId: -1 });

        // If a user already exists in this range, start the counter from their ID.
        // Otherwise, start the counter from the minimum value.
        const startValue = lastUserInDb ? lastUserInDb.userId : min - 1;

        // Atomically create the counter. The 'upsert' option prevents race conditions.
        counter = await Counter.findOneAndUpdate(
            { _id: counterId },
            // Set the counter to the start value, then increment it.
            { $setOnInsert: { seq: startValue } },
            { new: true, upsert: true }
        );
        
        // Now, increment the newly created counter to get the next ID
        counter = await Counter.findOneAndUpdate(
            { _id: counterId },
            { $inc: { seq: 1 } },
            { new: true }
        );
    }

    // 4. Check if the ID range for this role has been exhausted.
    if (counter.seq > max) {
        // Roll back the change if the limit is reached to prevent future errors.
        await Counter.updateOne({ _id: counterId }, { $inc: { seq: -1 } });
        throw new Error(`ID range for role '${role}' has been exhausted.`);
    }

    return counter.seq;
}

module.exports = { generateCustomId };