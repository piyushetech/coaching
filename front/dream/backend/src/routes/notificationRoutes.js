const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = require('express').Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllRead);
router.post('/report', notificationController.reportUser);

module.exports = router;
