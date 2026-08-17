const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, notifController.list);
router.put('/:id/read', verifyToken, notifController.markRead);
router.put('/read-all', verifyToken, notifController.markAllRead);

module.exports = router;
