const nannyController = require('../controllers/nannyController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = require('express').Router();

router.use(protect, restrictTo('nanny'));

router.get('/profile', nannyController.getNannyProfile);
router.patch('/profile', nannyController.updateNannyProfile);
router.post('/profile/photo', upload.single('photo'), nannyController.uploadProfilePhoto);
router.post('/documents', upload.single('document'), nannyController.uploadDocument);
router.post('/certificates', upload.single('certificate'), nannyController.uploadCertificate);
router.post('/gallery', upload.single('image'), nannyController.uploadGalleryImage);
router.patch('/availability', nannyController.updateAvailability);
router.patch('/online-status', nannyController.updateOnlineStatus);

module.exports = router;
