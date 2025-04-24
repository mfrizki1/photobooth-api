const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/uploads', verifyToken, imageController.uploadImages);
router.get('/list', verifyToken, imageController.getImages);

module.exports = router;