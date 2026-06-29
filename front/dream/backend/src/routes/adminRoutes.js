const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = require('express').Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/ban', adminController.banUser);
router.get('/nannies/pending', adminController.getPendingNannies);
router.get('/nannies', adminController.getAllNannies);
router.get('/parents', adminController.getAllParents);
router.patch('/nannies/:id/approve', adminController.approveNanny);
router.patch('/nannies/:id/reject', adminController.rejectNanny);
router.patch('/nannies/:id/verify-document', adminController.verifyDocument);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.resolveReport);
router.get('/reviews', adminController.getReviews);
router.patch('/reviews/:id/toggle', adminController.toggleReviewVisibility);

module.exports = router;
