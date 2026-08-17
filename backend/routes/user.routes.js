const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/:id', userController.getProfile);
router.get('/:id/stats', userController.getStats);
router.get('/:id/activity', userController.getActivity);
router.get('/:id/submissions', userController.getSubmissions);
router.put('/:id', verifyToken, userController.updateProfile);

module.exports = router;
