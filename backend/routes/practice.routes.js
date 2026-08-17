const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practice.controller');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// Public catalog routes
router.get('/languages', practiceController.getLanguages);
router.get('/recommendations', verifyToken, practiceController.getRecommendations);
router.get('/learning-path', verifyToken, practiceController.getLearningPath);
router.get('/program/:id', practiceController.getProgramById);
router.get('/:language', practiceController.getProgramsByLanguage);

// Execution & submission
router.post('/run', verifyToken, practiceController.runCode);
router.post('/submit', verifyToken, practiceController.submitCode);

// Faculty / Admin create program
router.post('/create', verifyToken, requireRole('faculty', 'admin'), practiceController.createProgram);

module.exports = router;
