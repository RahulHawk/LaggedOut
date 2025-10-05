const express = require('express');
const GameController = require('../controller/gameController');
const authCheck = require('../middleware/authentication');
const { adminOnly, adminOrDeveloper } = require('../middleware/authorization');
const uploadErrorHandler = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post("/create", authCheck, adminOrDeveloper, uploadErrorHandler, GameController.createGame);
router.post("/add-edition/:gameId", authCheck, adminOrDeveloper, uploadErrorHandler, GameController.addEdition);
router.post("/add-dlc/:gameId", authCheck, adminOrDeveloper, uploadErrorHandler, GameController.addDLC);
router.put("/update/:id", authCheck, adminOrDeveloper, uploadErrorHandler, GameController.updateGame);
router.delete("/delete/:id", authCheck, adminOrDeveloper, GameController.deleteGame);
router.put("/:gameId/update-edition/:editionId", authCheck, adminOrDeveloper, uploadErrorHandler, GameController.updateEdition);
router.delete("/:gameId/delete-edition/:editionId", authCheck, adminOrDeveloper, GameController.deleteEdition);
router.put("/:gameId/update-dlc/:dlcId", authCheck, adminOrDeveloper, uploadErrorHandler, GameController.updateDLC);
router.delete("/:gameId/delete-dlc/:dlcId", authCheck, adminOrDeveloper, GameController.deleteDLC);
router.put("/approve/:id", authCheck, adminOnly, GameController.approveGame);
router.get("/all", GameController.getAllGames);
router.get("/my-games", authCheck, adminOrDeveloper, GameController.getMyGames);
router.get("/single/:id", authCheck, GameController.getSingleGame);
router.get("/recommendations", authCheck, GameController.getRecommendations);

module.exports = router;