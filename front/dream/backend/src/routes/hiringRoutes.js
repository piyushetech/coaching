const hiringController = require('../controllers/hiringController');
const { protect } = require('../middleware/auth');

const router = require('express').Router();

router.use(protect);

router.get('/', hiringController.getMyRequests);
router.post('/', hiringController.createHiringRequest);
router.patch('/:requestId/respond', hiringController.respondToRequest);
router.patch('/:requestId/interview', hiringController.scheduleInterview);
router.patch('/:requestId/confirm', hiringController.confirmHire);
router.patch('/:requestId/complete', hiringController.completeJob);
router.patch('/:requestId/cancel', hiringController.cancelRequest);

module.exports = router;
