const path = require('path');
const multerConfig = require('../config/multerConfig');
const fs = require('fs').promises;
const Image = require('../models/Image');

exports.uploadImages = async (req, res) => {
    try {
        const upload = multerConfig.array('images', 10);
        
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: `Failed to upload images: ${err.message}`
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No images uploaded'
                });
            }

            // Get userId from decoded JWT token
            const userId = req.user?.userId;  // Changed from req.user.id to req.user.userId

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            const expireData = new Date();
            expireData.setDate(expireData.getDate() + 7);

            const savedImages = await Promise.all(
                req.files.map(async (file) => {
                    return await Image.create({
                        filename: file.filename,
                        imageUrl: `/uploads/${file.filename}`,
                        userId: userId,
                        expireData: expireData
                    });
                })
            );

            res.json({
                success: true,
                message: 'Images uploaded successfully',
                object: {
                    files: savedImages
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// Add this new function to get all images
exports.getImages = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: images } = await Image.findAndCountAll({
            attributes: ['id', 'filename', 'imageUrl', 'userId', 'expireData', 'createdAt'],
            where: { 
                userId: userId 
            },
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
              },
            success: true,
            message: 'Images retrieved successfully',
            object: {
                images
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};