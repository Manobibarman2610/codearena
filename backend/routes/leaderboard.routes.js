const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/global', leaderboardController.getGlobal);
router.get('/top3', leaderboardController.getTop3);
router.get('/myrank', verifyToken, leaderboardController.getMyRank);
router.get('/contest/:id', leaderboardController.getContestLeaderboard);

module.exports = router;
