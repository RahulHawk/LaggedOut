const User = require("../model/userModel");

class HomeController {
    async getLibrary(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .populate({
                    path: 'library.game',
                    model: 'Game'
                });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ library: user.library });

        } catch (error) {
            console.error("Get Library Error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async addFavorite(req, res) {
        try {
            const { gameId } = req.body;
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const isGameInLibrary = user.library.some(item => item.game.toString() === gameId);
            if (!isGameInLibrary) {
                return res.status(400).json({ message: "You can only favorite games in your library" });
            }
            if (user.favorites.some(favId => favId.toString() === gameId)) {
                return res.status(400).json({ message: "Game is already in your favorites" });
            }

            user.favorites.addToSet(gameId);
            await user.save();
            const updatedUser = await User.findById(req.user.id).populate('favorites');

            res.status(200).json({
                message: "Added to favorites",
                favorites: updatedUser.favorites
            });

        } catch (err) {
            console.error("Add to Favorites Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }


    async removeFavorite(req, res) {
        try {
            const { gameId } = req.params;

            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $pull: { favorites: gameId } },
                { new: true }
            );

            if (!user) return res.status(404).json({ message: "User not found" });

            res.status(200).json({ message: "Removed from favorites", favorites: user.favorites });
        } catch (err) {
            console.error("Remove Favorite Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getFavorites(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .populate({ path: "favorites", select: "title coverImage basePrice editions dlcs" });

            if (!user) return res.status(404).json({ message: "User not found" });

            const favorites = user.favorites.map(game => ({
                id: game._id,
                title: game.title,
                coverImage: game.coverImage,
                basePrice: game.basePrice,
                editions: game.editions,
                dlcs: game.dlcs
            }));

            res.status(200).json({ favorites });
        } catch (err) {
            console.error("Get Favorites Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async addToWishlist(req, res) {
        try {
            const { gameId } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.library.some(item => item.game.toString() === gameId)) {
                return res.status(400).json({ message: "You cannot wishlist games you already own" });
            }
            const alreadyInWishlist = user.wishlist.some(item => item.game.toString() === gameId);
            if (alreadyInWishlist) {
                return res.status(400).json({ message: "This game is already in your wishlist" });
            }

            user.wishlist.push({ game: gameId });
            await user.save();

            const populatedUser = await User.findById(user._id).populate('wishlist.game');

            res.status(200).json({ message: "Added to wishlist", wishlist: populatedUser.wishlist });

        } catch (err) {
            console.error("Add to Wishlist Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async removeFromWishlist(req, res) {
        try {
            const { gameId } = req.params;

            if (!gameId) {
                return res.status(400).json({ message: "Game ID is required." });
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { $pull: { wishlist: { game: gameId } } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found." });
            }

            res.status(200).json({ message: "Removed from wishlist", wishlist: updatedUser.wishlist });

        } catch (err) {
            console.error("Remove from Wishlist Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getWishlist(req, res) {
        try {
            const user = await User.findById(req.user.id).populate({
                path: 'wishlist.game',
                model: 'Game'
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ wishlist: user.wishlist });

        } catch (error) {
            console.error("Get Wishlist Error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = new HomeController();
