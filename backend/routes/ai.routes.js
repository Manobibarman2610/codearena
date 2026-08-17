const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/analyze', verifyToken, aiController.analyzeCode);
router.get('/history/:problemId', verifyToken, aiController.getHistory);

module.exports = router;
