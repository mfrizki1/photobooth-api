const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, paymentController.createPayment);
router.get('/status/:orderId', verifyToken, paymentController.getStatus);
router.get('/list', verifyToken, paymentController.getPaymentList);
router.post('/callback', paymentController.simulateCallback);

// Endpoint untuk menerima notifikasi dari Midtrans
router.post('/notification', paymentController.midtransNotification);

// Endpoint untuk callback Midtrans
router.get('/finish', paymentController.finishCallback);
router.get('/error', paymentController.errorCallback);
router.get('/pending', paymentController.pendingCallback);

module.exports = router;