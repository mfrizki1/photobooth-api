const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         filename:
 *           type: string
 *         imageUrl:
 *           type: string
 *         userId:
 *           type: integer
 *         expireData:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/images/uploads:
 *   post:
 *     tags: [Images]
 *     summary: Upload multiple images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Image"
 *       400:
 *         description: Invalid input or no files uploaded
 *       401:
 *         description: Unauthorized
 */
router.post("/uploads", verifyToken, imageController.uploadImages);

/**
 * @swagger
 * /api/images/list:
 *   get:
 *     tags: [Images]
 *     summary: Get list of user images
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of images retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Image"
 *       401:
 *         description: Unauthorized
 */
router.get("/list", verifyToken, imageController.getImages);

module.exports = router;
