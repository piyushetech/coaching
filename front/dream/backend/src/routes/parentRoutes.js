const parentController = require('../controllers/parentController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = require('express').Router();

router.use(protect, restrictTo('parent'));

router.get('/profile', parentController.getParentProfile);
router.patch('/profile', parentController.updateParentProfile);
router.post('/profile/photo', upload.single('photo'), parentController.uploadParentPhoto);
router.get('/favorites', parentController.getFavorites);
router.post('/favorites/:nannyId', parentController.addFavorite);
router.delete('/favorites/:nannyId', parentController.removeFavorite);
router.post('/recently-viewed/:nannyId', parentController.addRecentlyViewed);

module.exports = router;
