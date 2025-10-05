const express = require('express');
const GenreTagController = require('../controller/genre&tagController');
const authCheck = require('../middleware/authentication');
const { adminOnly } = require('../middleware/authorization');
const router = express.Router();

router.get("/genres", GenreTagController.getAllGenres);
router.get("/tags", GenreTagController.getAllTags);
router.get("/genres/previews", GenreTagController.getGamesByGenrePreview);
router.post("/add-genre", authCheck, adminOnly, GenreTagController.addGenre);
router.post("/add-bulk-genre", authCheck, adminOnly, GenreTagController.addBulkGenre);
router.put("/update-genre/:id", authCheck, adminOnly, GenreTagController.updateGenre);
router.delete("/delete-genre/:id", authCheck, adminOnly, GenreTagController.deleteGenre);
router.post("/add-tag", authCheck, adminOnly, GenreTagController.addTag);
router.post("/add-bulk-tag", authCheck, adminOnly, GenreTagController.addBulkTag);
router.put("/update-tag/:id", authCheck, adminOnly, GenreTagController.updateTag);
router.delete("/delete-tag/:id", authCheck, adminOnly, GenreTagController.deleteTag);

module.exports = router;