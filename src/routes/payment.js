const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     tags: [Payments]
 *     summary: Create a new payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/create", verifyToken, paymentController.createPayment);

/**
 * @swagger
 * /api/payment/status/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get("/status/:orderId", verifyToken, paymentController.getStatus);

/**
 * @swagger
 * /api/payment/list:
 *   get:
 *     tags: [Payments]
 *     summary: Get list of user payments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/list", verifyToken, paymentController.getPaymentList);

/**
 * @swagger
 * /api/payment/callback:
 *   post:
 *     tags: [Payments]
 *     summary: Simulate payment callback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Callback processed successfully
 */
router.post("/callback", paymentController.simulateCallback);

/**
 * @swagger
 * /api/payment/notification:
 *   post:
 *     tags: [Payments]
 *     summary: Handle Midtrans notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Notification processed successfully
 */
router.post("/notification", paymentController.midtransNotification);

/**
 * @swagger
 * /api/payment/finish:
 *   get:
 *     tags: [Payments]
 *     summary: Handle successful payment callback
 *     responses:
 *       200:
 *         description: Payment completed successfully
 */
router.get("/finish", paymentController.finishCallback);

/**
 * @swagger
 * /api/payment/error:
 *   get:
 *     tags: [Payments]
 *     summary: Handle failed payment callback
 *     responses:
 *       200:
 *         description: Payment error handled
 */
router.get("/error", paymentController.errorCallback);

/**
 * @swagger
 * /api/payment/pending:
 *   get:
 *     tags: [Payments]
 *     summary: Handle pending payment callback
 *     responses:
 *       200:
 *         description: Payment pending status handled
 */
router.get("/pending", paymentController.pendingCallback);

module.exports = router;
