const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

const router = require('express').Router();

router.get('/nanny/:nannyId', reviewController.getNannyReviews);
router.post('/', protect, restrictTo('parent'), reviewController.createReview);

module.exports = router;
