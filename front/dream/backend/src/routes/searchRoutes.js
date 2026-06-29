const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = require('express').Router();

router.get('/', searchController.searchNannies);
router.get('/recommendations', protect, searchController.getRecommendations);
router.get('/:id', searchController.getNannyById);

module.exports = router;
