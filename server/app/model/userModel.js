const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, required: true, index: true, lowercase: true },
    password: {
        type: String,
        required: function () {
            return this.authProviders.some(p => p.provider === "local");
        }
    },
    role: { type: Schema.Types.ObjectId, ref: "Role" },
    userId: { type: Number, unique: true, sparse: true },
    isUsernameSet: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    lastVerificationEmailSentAt: Date,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    authProviders: [
        {
            provider: { type: String, enum: ["local", "google"], required: true },
            providerId: { type: String }
        }
    ],

    // ===== Developer =====
    isDeveloperApproved: { type: Boolean, default: false },
    developerRequest: {
        requestedAt: Date,
        requestToken: String,
        approvedAt: Date,
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        isRequestApproved: { type: Boolean, default: false }
    },
    followingDevelopers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // ===== Player =====
    wishlist: [
        {
            game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
            addedAt: { type: Date, default: Date.now }
        }
    ],
    library: [
        {
            game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
            addedAt: { type: Date, default: Date.now }
        }
    ],
    cart: [
        {
            game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
            editionId: { type: Schema.Types.ObjectId },
            dlcId: { type: Schema.Types.ObjectId }
        }
    ],
    favorites: [{ type: Schema.Types.ObjectId, ref: "Game" }],
    recentlyViewed: [{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }],

    // Profile customization
    profile: {
        profilePic: { type: String, default: "/default-avatar.png" },
        firstNameDisplay: { type: String },
        lastNameDisplay: { type: String },
        selectedAvatar: { type: Schema.Types.ObjectId, ref: "Avatar" },
        bio: { type: String, maxlength: 500 },
        theme: { type: String, default: "light" },
        showcaseGames: [{ type: Schema.Types.ObjectId, ref: "Game" }],
        privacy: { type: String, enum: ["public", "friends", "private"], default: "public" }
    },

    // Friend system
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
},
    {
        timestamps: true
    });

const User = mongoose.model("User", userSchema);
module.exports = User;
