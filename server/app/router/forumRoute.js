const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authentication");
const forumController = require("../controller/forumController");

// Posts
router.post("/", authCheck, forumController.createPost);
router.get("/game/:gameId", forumController.getPostsByGame);
router.get("/:postId", forumController.getPostById);
router.put("/:postId", authCheck, forumController.updatePost);
router.delete("/:postId", authCheck, forumController.deletePost);

// Comments
router.post("/:postId/comment", authCheck, forumController.addComment);
router.delete("/:postId/comment/:commentId", authCheck, forumController.deleteComment);

// Likes/Dislikes
router.post("/:postId/like", authCheck, forumController.likePost);
router.post("/:postId/dislike", authCheck, forumController.dislikePost);
router.post("/:postId/comment/:commentId/like", authCheck, forumController.likeComment);
router.post("/:postId/comment/:commentId/dislike", authCheck, forumController.dislikeComment);

// Paginated posts
router.get("/game/:gameId/paginated", forumController.getPostsByGamePaginated);

module.exports = router;