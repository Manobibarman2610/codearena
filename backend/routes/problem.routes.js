const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problem.controller');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// Public routes
router.get('/', problemController.listProblems);
router.get('/:id', problemController.getProblem);
router.get('/slug/:slug', problemController.getProblemBySlug);
router.get('/:id/hints', problemController.getHints);

// Protected routes
router.post('/:id/hints/:hintNum/unlock', verifyToken, problemController.unlockHint);

// Faculty & Admin only
router.post('/', verifyToken, requireRole('faculty', 'admin'), problemController.createProblem);
router.put('/:id', verifyToken, requireRole('faculty', 'admin'), problemController.updateProblem);
router.delete('/:id', verifyToken, requireRole('faculty', 'admin'), problemController.deleteProblem);
router.post('/:id/testcases', verifyToken, requireRole('faculty', 'admin'), problemController.addTestCase);

module.exports = router;
