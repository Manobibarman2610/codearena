const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

router.get('/users', verifyToken, requireRole('admin'), adminController.listUsers);
router.put('/users/:id/role', verifyToken, requireRole('admin'), adminController.changeRole);
router.delete('/users/:id', verifyToken, requireRole('admin'), adminController.deleteUser);
router.get('/stats', adminController.platformStats);

module.exports = router;
