const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = require('express').Router();

router.use(protect);

router.get('/', chatController.getMyChats);
router.get('/:chatId/messages', chatController.getChatMessages);
router.delete('/messages/:messageId', chatController.deleteMessage);
router.post('/:chatId/block', chatController.blockUser);

module.exports = router;
