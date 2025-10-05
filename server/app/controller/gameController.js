const Game = require("../model/gameModel");
const User = require("../model/userModel");
const Avatar = require("../model/avatarModel");
const uploadToCloudinary = require("../helper/cloudnaryHelper");
const Notification = require("../model/notificationModel");
const { createGameValidation } = require("../validations/gameValidation");
const getPublicId = require("../helper/getPublicId");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

class GameController {
    async createGame(req, res) {
        try {
            const fieldsToParse = ["systemRequirements", "genre", "tags"];
            fieldsToParse.forEach(field => {
                if (req.body[field] && typeof req.body[field] === "string") {
                    try {
                        req.body[field] = JSON.parse(req.body[field]);
                    } catch {
                        return res.status(400).json({ status: false, message: `Invalid JSON for ${field}` });
                    }
                }
            });

            const { error } = createGameValidation(req.body);
            if (error) return res.status(400).json({ status: false, message: error.details[0].message });

            let { title, description, basePrice, releaseDate, websiteUrl, systemRequirements, genre, tags } = req.body;

            const coverImageFile = req.files.coverImage?.[0];
            if (!coverImageFile) return res.status(400).json({ status: false, message: "Cover image is required" });

            const screenshotFiles = req.files.screenshots || [];
            const avatarFile = req.files.avatar?.[0];

            const coverImageUrl = await uploadToCloudinary(coverImageFile.path, "image", "games");

            const screenshotsUrls = await Promise.all(
                screenshotFiles.map(f => uploadToCloudinary(f.path, "image", "games/screenshots"))
            );

            const trailerFile = req.files.trailer?.[0];
            let trailerUrl = null;
            if (trailerFile) {
                trailerUrl = await uploadToCloudinary(
                    trailerFile.path,
                    "video",
                    "games/trailers",
                    { useUploadLarge: true }
                );
            }

            const newGame = new Game({
                title,
                description,
                basePrice,
                coverImage: coverImageUrl,
                screenshots: screenshotsUrls,
                trailer: trailerUrl || undefined,
                websiteUrl,
                releaseDate,
                systemRequirements,
                genre,
                tags,
                developer: req.user.id,
                bonusContent: { avatars: [] }
            });

            if (avatarFile) {
                const avatarUrl = await uploadToCloudinary(avatarFile.path, "image", "avatars");
                const avatar = await Avatar.create({
                    name: avatarFile.originalname.split(".")[0],
                    imageUrl: avatarUrl,
                    game: newGame._id,
                    developer: req.user.id
                });
                newGame.bonusContent.avatars.push(avatar._id);
            }

            await newGame.save();

            const followers = await User.find({ following: req.user.id });
            const notifications = followers.map(f => ({
                user: f._id,
                type: "new_game",
                data: { gameId: newGame._id, title: newGame.title }
            }));
            if (notifications.length) await Notification.insertMany(notifications);

            res.status(201).json({ status: true, message: "Game created successfully", data: newGame });

        } catch (error) {
            console.error("Create Game Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async addEdition(req, res) {
        try {
            const { gameId } = req.params;
            let { name, description, price, includesDLCs } = req.body;

            if (includesDLCs && typeof includesDLCs === "string") {
                try {
                    includesDLCs = JSON.parse(includesDLCs);
                    if (!Array.isArray(includesDLCs)) includesDLCs = [];
                } catch (err) {
                    return res.status(400).json({ status: false, message: "Invalid JSON for includesDLCs" });
                }
            }

            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const coverImageFile = req.files.coverImage?.[0];
            const screenshotFiles = req.files.screenshots || [];
            const avatarFile = req.files.avatar?.[0];

            let avatarIds = [];
            if (avatarFile) {
                const avatarUrl = await uploadToCloudinary(avatarFile.path, "image", "avatars");
                const avatar = await Avatar.create({
                    name: avatarFile.originalname.split(".")[0],
                    imageUrl: avatarUrl,
                    game: game._id,
                    developer: req.user.id
                });
                avatarIds.push(avatar._id);
            }

            game.editions.push({
                name,
                description,
                price,
                coverImage: coverImageFile ? await uploadToCloudinary(coverImageFile.path, "image", "games/editions") : "",
                screenshots: await Promise.all(screenshotFiles.map(f => uploadToCloudinary(f.path, "image", "games/editions/screenshots"))),
                bonusContent: { avatars: avatarIds },
                includesDLCs: includesDLCs || []
            });

            await game.save();
            res.status(201).json({ status: true, message: "Edition added successfully", data: game });

        } catch (error) {
            console.error("Add Edition Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async addDLC(req, res) {
        try {
            const { gameId } = req.params;
            const { title, description, price, releaseDate, systemRequirements } = req.body;

            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const coverImageFile = req.files.coverImage?.[0];
            const screenshotFiles = req.files.screenshots || [];
            const trailerFiles = req.files.trailer || [];
            const avatarFile = req.files.avatar?.[0];

            let avatarIds = [];
            if (avatarFile) {
                const avatarUrl = await uploadToCloudinary(avatarFile.path, "image", "avatars");
                const avatar = await Avatar.create({
                    name: avatarFile.originalname.split(".")[0],
                    imageUrl: avatarUrl,
                    game: game._id,
                    developer: req.user.id
                });
                avatarIds.push(avatar._id);
            }

            const coverImageUrl = coverImageFile
                ? await uploadToCloudinary(coverImageFile.path, "image", "games/dlcs")
                : "";

            const screenshotsUrls = await Promise.all(
                screenshotFiles.map(f => uploadToCloudinary(f.path, "image", "games/dlcs/screenshots"))
            );

            const trailerUrls = await Promise.all(
                trailerFiles.map(f => uploadToCloudinary(f.path, "video", "games/dlcs/trailers"))
            );
            const trailerUrl = trailerUrls.length ? trailerUrls[0] : "";

            game.dlcs.push({
                title,
                description,
                price,
                releaseDate,
                systemRequirements,
                coverImage: coverImageUrl,
                screenshots: screenshotsUrls,
                trailer: trailerUrl,
                bonusContent: { avatars: avatarIds },
                developer: req.user.id
            });

            await game.save();

            res.status(201).json({ status: true, message: "DLC added successfully", data: game });

        } catch (error) {
            console.error("Add DLC Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async updateGame(req, res) {
    try {
        const { id } = req.params;
        const game = await Game.findById(id);
        if (!game) return res.status(404).json({ message: "Game not found" });

        const fieldsToParse = ['systemRequirements', 'genre', 'tags', 'removeScreenshots'];
        fieldsToParse.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (error) {
                    console.error(`Error parsing ${field}:`, error);
                    return res.status(400).json({ message: `Invalid format for ${field}` });
                }
            }
        });

        // --- 2. UPDATE TEXT-BASED FIELDS ---
        const fields = ["title", "description", "basePrice", "websiteUrl", "releaseDate", "systemRequirements", "genre", "tags"];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                game[field] = req.body[field];
            }
        });

        if (req.body.removeCoverImage === true && game.coverImage) {
            // await deleteFromCloudinary(game.coverImage); // Optional: delete from cloud
            game.coverImage = null;
        }
        if (req.body.removeTrailer === true && game.trailer) {
            // await deleteFromCloudinary(game.trailer); // Optional: delete from cloud
            game.trailer = null;
        }
        if (Array.isArray(req.body.removeScreenshots) && req.body.removeScreenshots.length > 0) {
            // for (const url of req.body.removeScreenshots) {
            //     await deleteFromCloudinary(url); // Optional: delete from cloud
            // }
            // Filter out the removed screenshots from the game's array
            game.screenshots = game.screenshots.filter(url => !req.body.removeScreenshots.includes(url));
        }

        // --- 4. HANDLE FILE UPLOADS (Your existing logic) ---
        const uploadFields = [
            { key: "coverImage", type: "image", folder: "games/covers" },
            { key: "screenshots", type: "image", folder: "games/screenshots" },
            { key: "trailer", type: "video", folder: "games/trailers", options: { useUploadLarge: true } },
            { key: "avatar", type: "image", folder: "avatars" }
        ];

        for (const field of uploadFields) {
            const files = req.files?.[field.key];
            if (!files || files.length === 0) continue;

            try {
                if (field.key === 'screenshots') { // Specifically for screenshots to append, not replace
                    const urls = [];
                    for (const f of files) {
                        const url = await uploadToCloudinary(f.path, field.type, field.folder, field.options || {});
                        urls.push(url);
                    }
                    game.screenshots = [...game.screenshots, ...urls]; // Add new screenshots to existing ones
                } else if (files.length > 0) { // For single file fields like coverImage, trailer
                    const url = await uploadToCloudinary(files[0].path, field.type, field.folder, field.options || {});
                    game[field.key] = url;
                }
            } catch (err) {
                console.error(`Failed to upload ${field.key}:`, err);
            }
        }

        await game.save();
        res.status(200).json({ message: "Game updated successfully", game });
    } catch (err) {
        console.error("Error updating game:", err);
        // This will catch validation errors from game.save() as well
        res.status(500).json({ message: err.message || "Server error" });
    }
}

    async deleteGame(req, res) {
        try {
            const { id } = req.params;
            const game = await Game.findById(id);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const safeDelete = async (url, resource_type) => {
                const publicId = getPublicId(url);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type });
                    } catch (err) {
                        console.error(`Failed to delete ${resource_type} ${url}:`, err);
                    }
                }
            };

            await safeDelete(game.coverImage, "image");

            for (const url of game.screenshots || []) {
                await safeDelete(url, "image");
            }

            for (const url of game.trailer || []) {
                await safeDelete(url, "video");
            }

            const avatars = await Avatar.find({ game: game._id });
            for (const avatar of avatars) {
                await safeDelete(avatar.imageUrl, "image");
            }
            await Avatar.deleteMany({ game: game._id });

            await game.deleteOne();

            res.status(200).json({ status: true, message: "Game and all associated media deleted" });

        } catch (error) {
            console.error("Delete Game Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async updateEdition(req, res) {
        try {
            const { gameId, editionId } = req.params;
            const updates = { ...req.body };
            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const setUpdates = {};

            if (req.files.coverImage?.[0]) {
                const coverUrl = await uploadToCloudinary(req.files.coverImage[0].path, "image", "games/editions");
                setUpdates[`editions.$.coverImage`] = coverUrl;
            }

            if (req.files.screenshots) {
                const screenshotsUrls = await Promise.all(
                    req.files.screenshots.map(f => uploadToCloudinary(f.path, "image", "games/editions/screenshots"))
                );
                setUpdates[`editions.$.screenshots`] = screenshotsUrls;
            }

            if (req.files.avatar?.[0]) {
                const avatarUrl = await uploadToCloudinary(req.files.avatar[0].path, "image", "avatars");
                const avatar = await Avatar.create({
                    name: req.files.avatar[0].originalname.split(".")[0],
                    imageUrl: avatarUrl,
                    game: gameId,
                    developer: req.user.id
                });

                const edition = game.editions.id(editionId);
                const existingAvatars = edition?.bonusContent?.avatars || [];
                setUpdates[`editions.$.bonusContent.avatars`] = [...existingAvatars, avatar._id];
            }

            for (const key in updates) {
                if (updates[key] !== undefined && key !== "bonusContent") {
                    setUpdates[`editions.$.${key}`] = updates[key];
                }
            }

            const updatedGame = await Game.findOneAndUpdate(
                { _id: gameId, "editions._id": editionId },
                { $set: setUpdates },
                { new: true }
            );

            if (!updatedGame) return res.status(404).json({ status: false, message: "Edition not found" });

            res.status(200).json({ status: true, message: "Edition updated successfully", data: updatedGame });

        } catch (error) {
            console.error("Update Edition Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async deleteEdition(req, res) {
        try {
            const { gameId, editionId } = req.params;
            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const edition = game.editions.id(editionId);
            if (!edition) return res.status(404).json({ status: false, message: "Edition not found" });

            if (edition.coverImage) {
                await cloudinary.uploader.destroy(getPublicId(edition.coverImage), { resource_type: "image" });
            }

            await Promise.all(
                (edition.screenshots || []).map(url =>
                    cloudinary.uploader.destroy(getPublicId(url), { resource_type: "image" })
                )
            );

            const avatarIds = edition.bonusContent?.avatars || [];
            const avatars = await Avatar.find({ _id: { $in: avatarIds } });
            await Promise.all(
                avatars.map(avatar =>
                    avatar.imageUrl
                        ? cloudinary.uploader.destroy(getPublicId(avatar.imageUrl), { resource_type: "image" })
                        : Promise.resolve()
                )
            );
            await Avatar.deleteMany({ _id: { $in: avatarIds } });

            edition.deleteOne();
            await game.save();

            res.status(200).json({ status: true, message: "Edition and media deleted", data: game });

        } catch (error) {
            console.error("Delete Edition Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }


    async updateDLC(req, res) {
        try {
            const { gameId, dlcId } = req.params;
            const updates = { ...req.body };
            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const setUpdates = {};

            if (req.files.coverImage?.[0]) {
                const coverUrl = await uploadToCloudinary(req.files.coverImage[0].path, "image", "games/dlcs");
                setUpdates[`dlcs.$.coverImage`] = coverUrl;
            }

            if (req.files.screenshots) {
                const screenshotsUrls = await Promise.all(
                    req.files.screenshots.map(f => uploadToCloudinary(f.path, "image", "games/dlcs/screenshots"))
                );
                setUpdates[`dlcs.$.screenshots`] = screenshotsUrls;
            }

            if (req.files.trailer) {
                const trailerUrls = await Promise.all(
                    req.files.trailer.map(f => uploadToCloudinary(f.path, "video", "games/dlcs/trailers"))
                );
                setUpdates[`dlcs.$.trailer`] = trailerUrls;
            }

            if (req.files.avatar?.[0]) {
                const avatarUrl = await uploadToCloudinary(req.files.avatar[0].path, "image", "avatars");
                const avatar = await Avatar.create({
                    name: req.files.avatar[0].originalname.split(".")[0],
                    imageUrl: avatarUrl,
                    game: gameId,
                    developer: req.user.id
                });

                const dlc = game.dlcs.id(dlcId);
                const existingAvatars = dlc?.bonusContent?.avatars || [];
                setUpdates[`dlcs.$.bonusContent.avatars`] = [...existingAvatars, avatar._id];
            }

            for (const key in updates) {
                if (updates[key] !== undefined && key !== "bonusContent") {
                    setUpdates[`dlcs.$.${key}`] = updates[key];
                }
            }

            const updatedGame = await Game.findOneAndUpdate(
                { _id: gameId, "dlcs._id": dlcId },
                { $set: setUpdates },
                { new: true }
            );

            if (!updatedGame) return res.status(404).json({ status: false, message: "DLC not found" });

            res.status(200).json({ status: true, message: "DLC updated successfully", data: updatedGame });

        } catch (error) {
            console.error("Update DLC Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async deleteDLC(req, res) {
        try {
            const { gameId, dlcId } = req.params;
            const game = await Game.findById(gameId);
            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            const dlc = game.dlcs.id(dlcId);
            if (!dlc) return res.status(404).json({ status: false, message: "DLC not found" });

            if (dlc.coverImage) {
                await cloudinary.uploader.destroy(getPublicId(dlc.coverImage), { resource_type: "image" });
            }

            await Promise.all(
                (dlc.screenshots || []).map(url =>
                    cloudinary.uploader.destroy(getPublicId(url), { resource_type: "image" })
                )
            );

            await Promise.all(
                (dlc.trailer || []).map(url =>
                    cloudinary.uploader.destroy(getPublicId(url), { resource_type: "video" })
                )
            );

            const avatarIds = dlc.bonusContent?.avatars || [];
            const avatars = await Avatar.find({ _id: { $in: avatarIds } });
            await Promise.all(
                avatars.map(avatar =>
                    avatar.imageUrl
                        ? cloudinary.uploader.destroy(getPublicId(avatar.imageUrl), { resource_type: "image" })
                        : Promise.resolve()
                )
            );
            await Avatar.deleteMany({ _id: { $in: avatarIds } });

            game.dlcs = game.dlcs.filter(d => !d._id.equals(dlcId));
            await game.save();

            res.status(200).json({ status: true, message: "DLC and media deleted", data: game });

        } catch (error) {
            console.error("Delete DLC Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async approveGame(req, res) {
        try {
            const { id } = req.params;

            const game = await Game.findByIdAndUpdate(
                id,
                { approved: true },
                { new: true }
            );

            if (!game) return res.status(404).json({ status: false, message: "Game not found" });

            res.status(200).json({ status: true, message: "Game approved", data: game });
        } catch (error) {
            console.error("Approve Game Error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getAllGames(req, res) {
        try {
            const {
                search, genre, tag, developer,
                minPrice, maxPrice,
                sort = "newest",
                page = 1, limit = 10,
                groupBy,
                approved,
                showAll
            } = req.query;

            if (groupBy === 'developer') {
                const devPipeline = [
                    { $match: { approved: true, developer: { $exists: true, $ne: null } } },
                    { $lookup: { from: "users", localField: "developer", foreignField: "_id", as: "developerInfo" } },
                    { $unwind: "$developerInfo" },
                    { $group: { _id: "$developerInfo._id", firstName: { $first: "$developerInfo.firstName" }, lastName: { $first: "$developerInfo.lastName" } } },
                    { $sort: { firstName: 1 } },
                    { $project: { _id: 1, firstName: 1, lastName: 1 } }
                ];
                const developers = await Game.aggregate(devPipeline);
                return res.status(200).json({ status: true, message: "Developers retrieved successfully.", data: developers });
            }

            const matchStage = {};

            if (approved !== undefined) {
                matchStage.approved = JSON.parse(approved);
            } else if (!showAll) {
                matchStage.approved = true;
            }

            if (search) matchStage.title = { $regex: search, $options: "i" };
            if (genre) matchStage.genre = new mongoose.Types.ObjectId(genre);
            if (tag) matchStage.tags = new mongoose.Types.ObjectId(tag);
            if (developer) matchStage.developer = new mongoose.Types.ObjectId(developer);
            if (minPrice || maxPrice) {
                matchStage.basePrice = {};
                if (minPrice) matchStage.basePrice.$gte = parseFloat(minPrice);
                if (maxPrice) matchStage.basePrice.$lte = parseFloat(maxPrice);
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const sortOptions = {
                newest: { createdAt: -1 },
                oldest: { createdAt: 1 },
                price_asc: { basePrice: 1 },
                price_desc: { basePrice: -1 },
                rating_desc: { averageRating: -1 },
                rating_asc: { averageRating: 1 },
                updated_desc: { updatedAt: -1 },
            };

            const pipeline = [
                { $match: matchStage },
                { $lookup: { from: "users", localField: "developer", foreignField: "_id", as: "developer" } },
                { $unwind: { path: "$developer", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "genres", localField: "genre", foreignField: "_id", as: "genre" } },
                { $lookup: { from: "tags", localField: "tags", foreignField: "_id", as: "tags" } },
                {
                    $project: {
                        title: 1, basePrice: 1, salePrice: 1, onSale: 1,
                        approved: 1,
                        coverImage: 1, screenshots: 1, averageRating: 1, createdAt: 1,
                        tags: 1, genre: 1, releaseDate: 1,
                        developer: { _id: "$developer._id", firstName: "$developer.firstName", lastName: "$developer.lastName" }
                    }
                },
                { $sort: sortOptions[sort] || sortOptions.newest },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ];

            const games = await Game.aggregate(pipeline);
            const total = await Game.countDocuments(matchStage);

            res.status(200).json({
                status: true,
                data: games,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error("getAllGames error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getSingleGame(req, res) {
        console.log("Checking for user in getSingleGame:", req.user);
        try {
            const { id } = req.params;

            const pipeline = [
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: "genres",
                        localField: "genre",
                        foreignField: "_id",
                        as: "genre"
                    }
                },
                {
                    $lookup: {
                        from: "tags",
                        localField: "tags",
                        foreignField: "_id",
                        as: "tags"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "developer",
                        foreignField: "_id",
                        as: "developer"
                    }
                },
                { $unwind: { path: "$developer", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "avatars",
                        localField: "bonusContent.avatars",
                        foreignField: "_id",
                        as: "bonusAvatars"
                    }
                },
                {
                    $lookup: {
                        from: "achievements",
                        localField: "editions.bonusContent.badges",
                        foreignField: "_id",
                        as: "editionBadges"
                    }
                }
            ];

            const game = await Game.aggregate(pipeline);

            if (!game || game.length === 0) {
                return res.status(404).json({ status: false, message: "Game not found" });
            }

            // Add to recently viewed
            if (req.user) {
                await User.findByIdAndUpdate(req.user.id, {
                    $addToSet: { recentlyViewed: game[0]._id }
                });
            }

            res.status(200).json({ status: true, data: game[0] });

        } catch (error) {
            console.error("getSingleGame error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getRecommendations(req, res) {
        try {
            const userId = req.user.id;

            const user = await User.findById(userId)
                .populate("friends", "_id library blockedUsers")
                .populate({
                    path: 'library.game',
                    select: '_id genre tags',
                    model: 'Game'
                })
                .populate("followingDevelopers", "_id");

            if (!user) return res.status(404).json({ status: false, message: "User not found" });

            // Recently viewed games
            const recentlyViewed = await Game.aggregate([
                { $match: { _id: { $in: user.recentlyViewed || [] } } },
                { $project: { _id: 1, title: 1, coverImage: 1, screenshots: 1 } },
                { $limit: 5 }
            ]);

            // Recommended by friends
            let recommendedByFriends = [];

            const userLibraryGameIds = new Set(user.library.map(item => item.game?._id.toString()));

            const friendsGames = [];
            const visibleFriends = user.friends.filter(friend =>
                !user.blockedUsers.includes(friend._id.toString()) &&
                !friend.blockedUsers.includes(user._id.toString())
            );

            visibleFriends.forEach(friend => {
                friend.library.forEach(item => {

                    if (item.game && !userLibraryGameIds.has(item.game.toString())) {
                        friendsGames.push(item.game);
                    }
                });
            });

            if (friendsGames.length > 0) {
                recommendedByFriends = await Game.aggregate([
                    { $match: { _id: { $in: friendsGames } } },
                    { $project: { _id: 1, title: 1, coverImage: 1, screenshots: 1 } },
                    { $limit: 5 }
                ]);
            }
            // Recommended by similarity
            let recommendedBySimilarity = [];

            const myGenres = user.library.flatMap(item => item.game?.genre || []).filter(Boolean);
            const myTags = user.library.flatMap(item => item.game?.tags || []).filter(Boolean);

            if (myGenres.length > 0 || myTags.length > 0) {
                recommendedBySimilarity = await Game.aggregate([
                    {
                        $match: {
                            $or: [
                                { genre: { $in: myGenres } },
                                { tags: { $in: myTags } }
                            ],
                            _id: { $nin: user.library.map(item => item.game._id) }
                        }
                    },
                    { $project: { _id: 1, title: 1, coverImage: 1, screenshots: 1 } },
                    { $limit: 5 }
                ]);
            }

            // Recommended by followed developers
            let recommendedByFollowing = [];
            const followedDeveloperIds = user.followingDevelopers.map(d => d._id);

            if (followedDeveloperIds.length > 0) {
                recommendedByFollowing = await Game.find({ developer: { $in: followedDeveloperIds } })
                    .select("_id title coverImage screenshots developer")
                    .limit(5)
                    .populate("developer", "firstName lastName");
            }


            res.status(200).json({
                status: true,
                data: {
                    recentlyViewed,
                    recommendedByFriends,
                    recommendedBySimilarity,
                    recommendedByFollowing
                }
            });

        } catch (error) {
            console.error("getRecommendations error:", error);
            res.status(500).json({ status: false, message: "Server error" });
        }
    }

    async getMyGames(req, res) {
        try {
            const developerId = req.user && req.user._id;

            if (!developerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const games = await Game.find({ developer: developerId })
                .populate('editions')
                .populate('dlcs');

            res.json({ success: true, data: games });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    };
}

module.exports = new GameController();
