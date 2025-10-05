const User = require("../model/userModel");
const Game = require("../model/gameModel");
const UserAchievement = require("../model/achievementModel");
const Activity = require("../model/activityModel");
const Review = require("../model/reviewModel");
const Forum = require("../model/forumModel");
const Inventory = require("../model/inventoryModel");
const Notification = require("../model/notificationModel");
const Role = require("../model/roleModel");
const uploadToCloudinary = require("../helper/cloudnaryHelper");
const { profileValidation } = require("../validations/userValidation");
const { comparePassword, HashedPassword } = require("../middleware/password");
const EmailVerificationLink = require("../helper/verificationMail");
const Purchase = require("../model/purchaseModel");

const getFullUserProfile = async (userId) => {
  const [user, achievements, recentActivity, inventory] = await Promise.all([
    User.findById(userId)
      .populate("profile.showcaseGames", "title coverImage")
      .populate("friends", "firstName lastName profile.profilePic profile.selectedAvatar")
      .populate({ path: "profile.selectedAvatar", model: "Avatar" })
      .populate("role", "name")
      .populate({
        path: "library",
        populate: {
          path: 'game',
          select: 'title coverImage developer editions dlcs'
        }
      }),
    UserAchievement.find({ user: userId })
      .populate({
        path: "achievement",
        populate: { path: "badge" }
      }),
    Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("game", "title"),
    Inventory.findOne({ user: userId })
      .populate('avatars badges')
  ]);

  if (!user) return null;

  const cleanRecentActivity = recentActivity.filter(activity => activity.game);
  const cleanLibrary = user.library.filter(item => item.game);

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.isUsernameSet ? user.userName : user.firstName,
    fullName: `${user.firstName} ${user.lastName}`,
    role: user.role.name,
    isUsernameSet: user.isUsernameSet,
    userName: user.userName,
    authProviders: user.authProviders,
    profile: {
      ...user.profile.toObject(),
      displayAvatar: user.profile.selectedAvatar?.imageUrl || user.profile.profilePic || "/default-avatar.png"
    },
    stats: {
      gamesOwned: cleanLibrary.length,
      wishlistCount: user.wishlist.length,
      achievementsUnlocked: achievements.length,
      friendsCount: user.friends.length
    },
    library: cleanLibrary,
    achievements,
    recentActivity: cleanRecentActivity,
    inventory: inventory || { avatars: [], badges: [] },
    friends: user.friends.map(f => ({
      id: f._id,
      name: `${f.firstName} ${f.lastName}`,
      avatar: f.profile.selectedAvatar?.imageUrl || f.profile.profilePic || "/default-avatar.png"
    }))
  };
};

const getFullDeveloperProfile = async (userId) => {
  const [developer, games] = await Promise.all([
    User.findById(userId).populate("role", "name"),
    Game.find({ developer: userId }).select("title coverImage approved") 
  ]);

  if (!developer) return null;

  const gameIds = games.map(g => g._id);

  const salesCount = await Activity.countDocuments({
    type: "purchase",
    game: { $in: gameIds }
  });

  const reviews = await Review.aggregate([
    { $match: { game: { $in: gameIds } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);

  const avgRating = reviews.length > 0 ? reviews[0].avgRating.toFixed(2) : "N/A";

  const stats = {
    totalGames: games.length,
    totalSales: salesCount,
    avgRating: avgRating
  };

  return {
    id: developer._id,
    displayName: developer.isUsernameSet ? developer.userName : developer.firstName,
    role: developer.role.name,
    stats: stats,
    profile: {
          ...developer.profile.toObject(),
          displayAvatar: developer.profile.profilePic || "/default-avatar.png"
        },
    uploadedGames: games.map(g => ({
      _id: g._id,
      title: g.title,
      coverImage: g.coverImage,
      approved: g.approved,
      status: g.approved ? "published" : "pending" 
    }))
  };
};


class ProfileController {
  async getMyProfile(req, res) {
    try {
      const profileData = await getFullUserProfile(req.user.id);
      if (!profileData) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
      res.status(200).json({ status: true, data: profileData });
    } catch (error) {
      console.error("Get My Profile Error:", error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async getMyDeveloperProfile(req, res) {
    try {
      const profileData = await getFullDeveloperProfile(req.user.id);
      if (!profileData) {
        return res.status(404).json({ status: false, message: "Developer not found" });
      }
      res.status(200).json({ status: true, data: profileData });
    } catch (error) {
      console.error("Get My Developer Profile Error:", error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async getPlayerProfile(req, res) {
    try {
      const { id } = req.params;
      const viewerId = req.user.id;
      const viewerRole = req.user.role;

      const user = await User.findById(id)
        .populate("profile.showcaseGames", "title coverImage")
        .populate("friends", "name profile.avatarUrl profile.profilePic profile.selectedAvatar")
        .populate("wishlist", "title coverImage")
        .populate("favorites", "title coverImage")
        .populate("library", "title coverImage")
        .populate("role", "name");

      if (!user) {
        return res.status(404).json({ status: false, message: "Player not found" });
      }

      const userRole = await Role.findById(user.role);

      if (!userRole || userRole.name !== "player") {
        return res.status(404).json({ status: false, message: "Player not found" });
      }

      if (
        req.user.blockedUsers.includes(id) ||
        user.blockedUsers.includes(viewerId)
      ) {
        return res.status(404).json({ message: "User not found." });
      }

      const privacy = user.profile.privacy;
      const isFriend = user.friends.some(f => f._id.toString() === viewerId);

      if ((privacy === "private" && viewerRole !== "admin") || (privacy === "friends" && viewerRole !== "admin" && !isFriend)) {
        return res.status(200).json({
          status: true,
          limited: true,
          data: {
            id: user._id,
            displayName: user.isUsernameSet ? user.userName : user.firstName,
            profile: {
              displayAvatar: user.profile.selectedAvatar?.imageUrl || user.profile.profilePic || "/default-avatar.png"
            },
          }
        });
      }

      const achievements = await UserAchievement.find({ user: user._id })
        .populate("achievement", "name description badgeIcon");

      const recentActivity = await Activity.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("game", "title coverImage");

      const canSeeRealName = viewerRole === "admin" || isFriend;

      res.status(200).json({
        status: true,
        data: {
          id: user._id,
          firstName: canSeeRealName ? user.firstName : (user.isUsernameSet ? user.userName : user.firstName),
          lastName: canSeeRealName ? user.lastName : (user.isUsernameSet ? "" : user.lastName),
          displayName: user.isUsernameSet ? user.userName : user.firstName,
          fullName: canSeeRealName ? `${user.firstName} ${user.lastName}` : null,
          role: user.role.name,
          profile: {
            ...user.profile.toObject(),
            profilePic: user.profile.profilePic,
            selectedAvatar: user.profile.selectedAvatar || null,
            displayAvatar: user.profile.selectedAvatar || user.profile.profilePic || "/default-avatar.png"
          },
          stats: {
            gamesOwned: user.library.length,
            wishlistCount: user.wishlist.length,
            achievementsUnlocked: achievements.length,
            friendsCount: user.friends.length
          },
          showcaseGames: user.profile.showcaseGames,
          recentActivity,
          achievements,
          friends: user.friends.map(f => ({
            id: f._id,
            name: f.name,
            avatar: f.profile.selectedAvatar || f.profile.profilePic || "/default-avatar.png"
          }))
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async getDeveloperProfile(req, res) {
    try {
      const { developerId } = req.params;

      const developer = await User.findById(developerId)
        .populate("role", "name")
        .select("-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken");

      if (!developer || developer.role.name !== "developer") {
        return res.status(404).json({ status: false, message: "Developer not found" });
      }

      const privacy = developer.profile.privacy;
      if (privacy === "private" && req.user.role !== "admin") {
        return res.status(403).json({ status: false, message: "This developer profile is private" });
      }

      const games = await Game.find({ developer: developer._id })
        .populate("genre", "name")
        .populate("tags", "name");

      const salesCount = await Activity.countDocuments({
        type: "purchase",
        game: { $in: games.map(g => g._id) }
      });

      const reviews = await Review.aggregate([
        { $match: { game: { $in: games.map(g => g._id) } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);

      const avgRating = reviews.length > 0 ? reviews[0].avgRating : null;

      const announcements = await Forum.find({ user: developer._id })
        .sort({ createdAt: -1 })
        .limit(5);

      const isFollowedByCurrentUser = developer.followers.some(
        followerId => followerId.toString() === req.user.id
      );

      res.status(200).json({
        status: true,
        data: {
          id: developer._id,
          firstName: developer.firstName,
          lastName: developer.lastName,
          role: developer.role.name,
          profile: {
            ...developer.profile.toObject(),
            profilePic: developer.profile.profilePic,
            selectedAvatar: developer.profile.selectedAvatar || null,
            displayAvatar: developer.profile.selectedAvatar || developer.profile.profilePic || "/default-avatar.png"
          },
          isFollowedByCurrentUser,
          stats: {
            totalGames: games.length,
            totalSales: salesCount,
            avgRating: avgRating ? avgRating.toFixed(2) : "No ratings yet"
          },
          uploadedGames: games,
          announcements
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async getDeveloperAnalytics(req, res) {
    try {
        const developerId = req.user.id;

        // First, get all games published by this developer
        const games = await Game.find({ developer: developerId }).select('_id');
        const gameIds = games.map(g => g._id);

        if (gameIds.length === 0) {
            return res.status(200).json({
                status: true,
                data: { totalRevenue: 0, revenueByGame: [] }
            });
        }

        // Use an aggregation pipeline to calculate revenue per game
        const revenueByGame = await Purchase.aggregate([
            // Match only purchases for this developer's games
            { $match: { game: { $in: gameIds } } },
            // Group by game ID, summing the price paid and counting sales
            {
                $group: {
                    _id: "$game",
                    totalRevenue: { $sum: "$pricePaid" },
                    salesCount: { $sum: 1 }
                }
            },
            // Join with the games collection to get game titles
            {
                $lookup: {
                    from: "games",
                    localField: "_id",
                    foreignField: "_id",
                    as: "gameDetails"
                }
            },
            // Reshape the output
            {
                $project: {
                    _id: 0,
                    gameId: "$_id",
                    gameTitle: { $arrayElemAt: ["$gameDetails.title", 0] },
                    totalRevenue: "$totalRevenue",
                    salesCount: "$salesCount"
                }
            }
        ]);

        // Calculate the overall total revenue from the per-game results
        const totalRevenue = revenueByGame.reduce((acc, game) => acc + game.totalRevenue, 0);

        res.status(200).json({
            status: true,
            data: {
                totalRevenue,
                revenueByGame
            }
        });

    } catch (error) {
        console.error("Get Developer Analytics Error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
}

  async setUsername(req, res) {
    try {
      const { userName } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) return res.status(404).json({ status: false, message: "User not found" });
      if (user.isUsernameSet) return res.status(400).json({ status: false, message: "Username already set" });

      const existing = await User.findOne({ userName });
      if (existing) return res.status(400).json({ status: false, message: "Username already taken" });

      user.userName = userName;
      user.isUsernameSet = true;
      user.profile.firstNameDisplay = userName;
      user.profile.lastNameDisplay = user.lastName;

      await user.save();

      res.status(200).json({
        status: true,
        message: "Username set successfully",
        user: {
          fullName: `${user.firstName} ${user.lastName}`,
          userName: user.userName
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async updateProfile(req, res) {
    try {
      if (typeof req.body.showcaseGames === 'string') {
        try {
          req.body.showcaseGames = JSON.parse(req.body.showcaseGames);
        } catch {
          req.body.showcaseGames = [];
        }
      }
      const { error } = profileValidation(req.body);
      if (error) return res.status(400).json({ status: false, message: error.details[0].message });

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ status: false, message: "User not found" });

      if (req.files && req.files.profilePic) {
        const uploadResult = await uploadToCloudinary(req.files.profilePic[0].path);
        user.profile.profilePic = uploadResult;
        user.profile.selectedAvatar = null;
      }

      const updatableFields = ['firstName', 'lastName', 'userName', 'bio', 'privacy', 'showcaseGames', 'selectedAvatar'];
      updatableFields.forEach(field => {
        // This check correctly handles an empty array for showcaseGames
        if (req.body[field] !== undefined) {
          if (['showcaseGames', 'selectedAvatar', 'bio', 'privacy'].includes(field)) {
            user.profile[field] = req.body[field];
          } else {
            user[field] = req.body[field];
          }
        }
      });
      if (req.body.userName) {
        user.isUsernameSet = true;
      }

      // Save the updated user document
      const savedUser = await user.save();

      // --- FIX: Instead of refetching, use the now-saved user object and populate it ---
      const populatedUser = await savedUser.populate([
        { path: "profile.showcaseGames", select: "title coverImage" },
        { path: "friends", select: "firstName lastName profile.profilePic profile.selectedAvatar" },
        { path: "profile.selectedAvatar", model: "Avatar" },
        { path: "role", select: "name" },
      ]);

      // We still need to fetch the other data for the full profile response
      const [achievements, recentActivity, inventory] = await Promise.all([
        UserAchievement.find({ user: populatedUser._id }).populate({ path: "achievement", populate: { path: "badge" } }),
        Activity.find({ user: populatedUser._id }).sort({ createdAt: -1 }).limit(5).populate("game", "title"),
        Inventory.findOne({ user: populatedUser._id }).populate('avatars badges')
      ]);

      // Now, construct the response using the guaranteed fresh data
      const responseData = {
        id: populatedUser._id,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        displayName: populatedUser.isUsernameSet ? populatedUser.userName : populatedUser.firstName,
        fullName: `${populatedUser.firstName} ${populatedUser.lastName}`,
        role: populatedUser.role.name,
        isUsernameSet: populatedUser.isUsernameSet,
        userName: populatedUser.userName,
        authProviders: populatedUser.authProviders,
        profile: {
          ...populatedUser.profile.toObject(),
          displayAvatar: populatedUser.profile.selectedAvatar?.imageUrl || populatedUser.profile.profilePic || "/default-avatar.png"
        },
        stats: {
          gamesOwned: populatedUser.library.length,
          wishlistCount: populatedUser.wishlist.length,
          achievementsUnlocked: achievements.length,
          friendsCount: populatedUser.friends.length
        },
        library: populatedUser.library,
        achievements,
        recentActivity: recentActivity.filter(act => act.game),
        inventory: inventory || { avatars: [], badges: [] },
        friends: populatedUser.friends.map(f => ({
          id: f._id,
          name: `${f.firstName} ${f.lastName}`,
          avatar: f.profile.selectedAvatar?.imageUrl || f.profile.profilePic || "/default-avatar.png"
        }))
      };
      // --- END FIX ---

      res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        data: responseData,
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async updateEmail(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ status: false, message: "User not found" });

      const { newEmail } = req.body;
      if (!newEmail) return res.status(400).json({ status: false, message: "Email is required" });

      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) return res.status(400).json({ status: false, message: "Email already in use" });

      user.email = newEmail;
      user.isVerified = false;

      await user.save();

      await EmailVerificationLink(req, user);

      res.status(200).json({ status: true, message: "Email updated. Verification sent to new email." });
    } catch (error) {
      console.error("Update Email Error:", error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async updatePassword(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ status: false, message: "User not found" });

      const { currentPassword, newPassword } = req.body;
      if (!newPassword)
        return res.status(400).json({ status: false, message: "New password is required" });

      const hasLocal = user.authProviders.some(p => p.provider === "local");

      if (hasLocal) {
        if (!currentPassword) {
          return res.status(400).json({ status: false, message: "Current password is required" });
        }

        const isMatch = await comparePassword(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ status: false, message: "Current password is incorrect" });
        }
      }

      if (!hasLocal) {
        user.authProviders.push({ provider: "local" });
      }

      const hashedPassword = await HashedPassword(newPassword);
      user.password = hashedPassword;

      await user.save();

      res.status(200).json({ status: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Update Password Error:", error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async linkGoogleAccount(req, res) {
    try {
      const user = req.user;
      const googleProfile = req.account;

      const alreadyLinked = user.authProviders.some(p => p.provider === "google");
      if (alreadyLinked) {
        return res.status(400).json({ status: false, message: "Google already linked to your account" });
      }

      user.authProviders.push({ provider: "google", providerId: googleProfile.id });
      await user.save();

      res.status(200).json({ status: true, message: "Google account linked successfully" });
    } catch (error) {
      console.error("Link Google Error:", error);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async followDeveloper(req, res) {
    try {
      const player = await User.findById(req.user.id);
      const developer = await User.findById(req.params.developerId).populate("role", "name");

      if (!developer || developer.role.name !== "developer") {
        return res.status(404).json({ status: false, message: "Developer not found" });
      }

      if (player.followingDevelopers.includes(developer._id)) {
        return res.status(400).json({ status: false, message: "Already following this developer" });
      }

      player.followingDevelopers.push(developer._id);
      developer.followers.push(player._id);

      await player.save();
      await developer.save();

      await Notification.create({
        user: developer._id,
        type: "follow",
        content: `${player.firstName} ${player.lastName} started following you.`,
        link: `/profile/${player._id}`,
        relatedUser: player._id
      });

      res.status(200).json({ status: true, message: "Developer followed successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async unfollowDeveloper(req, res) {
    try {
      const player = await User.findById(req.user.id);
      const developer = await User.findById(req.params.developerId).populate("role", "name");

      if (!developer || developer.role.name !== "developer") {
        return res.status(404).json({ status: false, message: "Developer not found" });
      }

      player.followingDevelopers = player.followingDevelopers.filter(
        id => id.toString() !== developer._id.toString()
      );
      developer.followers = developer.followers.filter(
        id => id.toString() !== player._id.toString()
      );

      await player.save();
      await developer.save();

      res.status(200).json({ status: true, message: "Developer unfollowed successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async getAllDevelopers(req, res) {
    try {
      const developers = await User.find({ role: await Role.findOne({ name: "developer" }) })
        .select("firstName lastName profile profilePic selectedAvatar");

      const data = developers.map(dev => ({
        id: dev._id,
        firstName: dev.firstName,
        lastName: dev.lastName,
        avatar: dev.profile.selectedAvatar || dev.profile.profilePic || "/default-avatar.png"
      }));

      res.status(200).json({ status: true, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async getFollowers(req, res) {
    try {
      const { developerId } = req.params;

      const developer = await User.findById(developerId)
        .populate("followers", "firstName lastName profile profilePic selectedAvatar")
        .populate("role", "name");

      if (!developer || developer.role.name !== "developer") {
        return res.status(404).json({ status: false, message: "Developer not found" });
      }

      const followers = developer.followers.map(f => ({
        id: f._id,
        firstName: f.firstName,
        lastName: f.lastName,
        avatar: f.profile.selectedAvatar || f.profile.profilePic || "/default-avatar.png"
      }));

      res.status(200).json({ status: true, data: followers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: "Server error" });
    }
  }
}


module.exports = new ProfileController();