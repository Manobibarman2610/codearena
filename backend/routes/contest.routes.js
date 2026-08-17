const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contest.controller');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/', contestController.listContests);
router.get('/:id', contestController.getContest);
router.post('/', verifyToken, requireRole('faculty', 'admin'), contestController.createContest);
router.post('/:id/join', verifyToken, contestController.joinContest);
router.get('/:id/leaderboard', contestController.getLeaderboard);
router.get('/:id/submissions', verifyToken, contestController.getSubmissions);

module.exports = router;
