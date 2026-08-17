const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, submissionController.createSubmission);
router.post('/run', verifyToken, submissionController.runCode);
router.get('/:id', verifyToken, submissionController.getSubmission);
router.get('/problem/:problemId', verifyToken, submissionController.getUserSubmissionsForProblem);

module.exports = router;
