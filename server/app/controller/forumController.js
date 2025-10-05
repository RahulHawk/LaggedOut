const Forum = require("../model/forumModel");
const Notification = require("../model/notificationModel");

class ForumController {
    async createPost(req, res) {
        try {
            const { game, type, title, content } = req.body;
            const author = req.user._id;

            if (type === "announcement") {
                if (!req.user.role?.name || !["admin", "developer"].includes(req.user.role.name.toLowerCase())) {
                    return res.status(403).json({ message: "Only developers or admins can create announcement posts." });
                }
            }

            const postType = type === "announcement" ? "announcement" : "discussion";

            const post = new Forum({ game, type: postType, title, content, author });
            await post.save();

            res.status(201).json({ message: "Forum post created", post });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async getPostsByGame(req, res) {
        try {
            const { gameId } = req.params;

            const posts = await Forum.find({ game: gameId })
                .populate("author", "firstName profile.profilePic")
                .populate("comments.user", "firstName profile.profilePic")
                .sort({ createdAt: -1 })
                .lean();

            res.json(posts);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async getPostById(req, res) {
        try {
            const { postId } = req.params;

            const post = await Forum.findById(postId)
                .populate("author", "firstName profile.profilePic")
                .populate("comments.user", "firstName profile.profilePic")
                .lean();

            if (!post) return res.status(404).json({ message: "Post not found" });
            res.json(post);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async updatePost(req, res) {
        try {
            const { postId } = req.params;
            const { title, content, type } = req.body;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            if (post.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "You can only edit your own posts" });
            }

            if (type === "announcement") {
                if (!req.user.role?.name || !["admin", "developer"].includes(req.user.role.name.toLowerCase())) {
                    return res.status(403).json({ message: "Only developers or admins can set post type to announcement" });
                }
            }

            post.title = title || post.title;
            post.content = content || post.content;
            post.type = type === "announcement" ? "announcement" : post.type;

            await post.save();
            res.json({ message: "Post updated", post });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async deletePost(req, res) {
        try {
            const { postId } = req.params;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            if (post.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "You can only delete your own posts" });
            }

            await post.deleteOne();
            res.json({ message: "Post deleted" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async addComment(req, res) {
        try {
            const { postId } = req.params;
            const { text } = req.body;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            post.comments.push({ user: req.user._id, text });
            await post.save();

            const commentObj = post.comments[post.comments.length - 1];

            await Notification.create({
                user: post.author,
                type: "comment",
                content: `${req.user.firstName} commented on your post: "${text}"`,
                relatedUser: req.user._id,
                link: `/forum/${post._id}`,
                meta: { postId: post._id, commentId: commentObj._id }
            });

            const populatedPost = await post.populate("comments.user", "firstName profile.profilePic");
            res.json({ message: "Comment added", post: populatedPost });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async deleteComment(req, res) {
        try {
            const { postId, commentId } = req.params;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            const comment = post.comments.id(commentId);
            if (!comment) return res.status(404).json({ message: "Comment not found" });

            if (comment.user.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "You can only delete your own comments or if you are the post author" });
            }

            comment.deleteOne();
            await post.save();

            res.json({ message: "Comment deleted", post });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async likePost(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user._id;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            const hasLiked = post.likes.includes(userId.toString());
            if (hasLiked) {
                post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            } else {
                post.likes.push(userId);
                post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
            }

            await post.save();

            res.json({
                message: hasLiked ? "Like removed" : "Post liked",
                likes: post.likes.length,
                dislikes: post.dislikes.length
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async dislikePost(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user._id;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            const hasDisliked = post.dislikes.includes(userId.toString());
            if (hasDisliked) {
                post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
            } else {
                post.dislikes.push(userId);
                post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            }

            await post.save();

            res.json({
                message: hasDisliked ? "Dislike removed" : "Post disliked",
                likes: post.likes.length,
                dislikes: post.dislikes.length
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async likeComment(req, res) {
        try {
            const { postId, commentId } = req.params;
            const userId = req.user._id;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            const comment = post.comments.id(commentId);
            if (!comment) return res.status(404).json({ message: "Comment not found" });

            const hasLiked = comment.likes.includes(userId.toString());
            if (hasLiked) {
                comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
            } else {
                comment.likes.push(userId);
                comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
            }

            await post.save();

            res.json({
                message: hasLiked ? "Like removed from comment" : "Comment liked",
                likes: comment.likes.length,
                dislikes: comment.dislikes.length
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async dislikeComment(req, res) {
        try {
            const { postId, commentId } = req.params;
            const userId = req.user._id;

            const post = await Forum.findById(postId);
            if (!post) return res.status(404).json({ message: "Post not found" });

            const comment = post.comments.id(commentId);
            if (!comment) return res.status(404).json({ message: "Comment not found" });

            const hasDisliked = comment.dislikes.includes(userId.toString());
            if (hasDisliked) {
                comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
            } else {
                comment.dislikes.push(userId);
                comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
            }

            await post.save();

            res.json({
                message: hasDisliked ? "Dislike removed from comment" : "Comment disliked",
                likes: comment.likes.length,
                dislikes: comment.dislikes.length
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }

    async getPostsByGamePaginated(req, res) {
        try {
            const { gameId } = req.params;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const posts = await Forum.find({ game: gameId })
                .populate("author", "firstName profile.profilePic")
                .populate("comments.user", "firstName profile.profilePic")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Forum.countDocuments({ game: gameId });

            res.json({
                posts,
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new ForumController();
