const Genre = require("../model/genreModel");
const Tag = require("../model/tagModel");
const mongoose = require("mongoose");

class GenreTagController {
    async addGenre(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ status: false, message: "Genre name is required" });
            }

            const existing = await Genre.findOne({ name });
            if (existing) {
                return res.status(400).json({ status: false, message: "Genre already exists" });
            }

            const genre = new Genre({ name });
            await genre.save();

            res.status(201).json({ status: true, message: "Genre created successfully", genre });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async addBulkGenre(req, res) {
        try {
            const { genres } = req.body;

            if (!genres || !Array.isArray(genres) || genres.length === 0) {
                return res.status(400).json({ message: "Genres array is required" });
            }

            const existing = await Genre.find({ name: { $in: genres } }).select("name");
            const existingNames = existing.map(g => g.name);

            const newGenres = genres.filter(name => !existingNames.includes(name));

            let createdGenres = [];
            if (newGenres.length > 0) {
                createdGenres = await Genre.insertMany(
                    newGenres.map(name => ({ name }))
                );
            }

            res.status(201).json({
                message: "Bulk genre creation processed",
                created: createdGenres,
                skipped: existingNames
            });
        } catch (error) {
            console.error("Bulk genre creation error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async updateGenre(req, res) {
        try {
            console.log("Genre ID:", req.params.id);

            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ status: false, message: "Genre name is required" });
            }
            const objectId = new mongoose.Types.ObjectId(id);

            const existing = await Genre.findOne({ name, _id: { $ne: objectId } });
            if (existing) {
                return res.status(400).json({ status: false, message: "Genre name already exists" });
            }

            const updatedGenre = await Genre.findByIdAndUpdate(objectId, { name }, { new: true });
            if (!updatedGenre) {
                return res.status(404).json({ status: false, message: "Genre not found" });
            }

            res.json({ status: true, message: "Genre updated successfully", genre: updatedGenre });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async deleteGenre(req, res) {
        try {
            const { id } = req.params;

            const deleted = await Genre.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({ message: "Genre not found" });
            }

            res.status(200).json({
                message: "Genre deleted successfully",
                deleted
            });
        } catch (error) {
            console.error("Delete genre error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async addTag(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ status: false, message: "Tag name is required" });
            }

            const existing = await Tag.findOne({ name });
            if (existing) {
                return res.status(400).json({ status: false, message: "Tag already exists" });
            }

            const tag = new Tag({ name });
            await tag.save();

            res.status(201).json({ status: true, message: "Tag created successfully", tag });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async addBulkTag(req, res) {
        try {
            const { tags } = req.body;

            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ message: "Tags array is required" });
            }

            const existing = await Tag.find({ name: { $in: tags } }).select("name");
            const existingNames = existing.map(t => t.name);

            const newTags = tags.filter(name => !existingNames.includes(name));

            let createdTags = [];
            if (newTags.length > 0) {
                createdTags = await Tag.insertMany(
                    newTags.map(name => ({ name }))
                );
            }

            res.status(201).json({
                message: "Bulk tag creation processed",
                created: createdTags,
                skipped: existingNames
            });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async updateTag(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ status: false, message: "Tag name is required" });
            }

            const existing = await Tag.findOne({ name, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ status: false, message: "Tag name already exists" });
            }

            const updatedTag = await Tag.findByIdAndUpdate(id, { name }, { new: true });
            if (!updatedTag) {
                return res.status(404).json({ status: false, message: "Tag not found" });
            }

            res.json({ status: true, message: "Tag updated successfully", tag: updatedTag });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async deleteTag(req, res) {
        try {
            const { id } = req.params;

            const deleted = await Tag.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({ message: "Tag not found" });
            }

            res.status(200).json({
                message: "Tag deleted successfully",
                deleted
            });
        } catch (error) {
            console.error("Delete tag error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async getAllGenres(req, res) {
        try {
            const genres = await Genre.find().sort({ name: 1 });
            res.status(200).json({ status: true, message: "Genres retrieved successfully", data: genres });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async getAllTags(req, res) {
        try {
            const tags = await Tag.find().sort({ name: 1 });
            res.status(200).json({ status: true, message: "Tags retrieved successfully", data: tags });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }

    async getGamesByGenrePreview(req, res) {
    try {
        const pipeline = [
            { $sort: { name: 1 } },
            {
                $lookup: {
                    from: 'games', 
                    let: { genreId: '$_id' },
                    pipeline: [
                        { $match: { 
                            $expr: {  $in: ['$$genreId', '$genre'] },
                            approved: true 
                        }},
                        { $sort: { averageRating: -1 } }, 
                        { $limit: 4 },
                        { 
                            $project: { 
                                title: 1, 
                                coverImage: 1, 
                                basePrice: 1, 
                                onSale: 1, 
                                salePrice: 1, 
                                averageRating: 1 
                            } 
                        }
                    ],
                    as: 'games'
                }
            },
            { $match: { 'games.0': { $exists: true } } }
        ];

        const genresWithGames = await Genre.aggregate(pipeline);

        res.status(200).json({
            status: true,
            message: "Genre previews retrieved successfully.",
            data: genresWithGames
        });

    } catch (error) {
        console.error("getGamesByGenrePreview error:", error);
        res.status(500).json({ status: false, message: "Server error" });
    }
}
}

module.exports = new GenreTagController();