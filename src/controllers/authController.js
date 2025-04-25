const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const {
    Op
} = require("sequelize");

/**
 * 
 * This is for base response
 * {
        success: true,
        error: "",
        message: "",
        result: [],
        object: {}
    }
 *
 */

// Mock user database
const users = [{
        id: 1,
        username: "user1",
        password: "password1"
    },
    {
        id: 2,
        username: "user2",
        password: "password2"
    },
];

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const dbUser = await User.findOne({
            where: { username }
        });

        if (dbUser) {
            const validPassword = await bcrypt.compare(password, dbUser.password)
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    error: "Invalid credentials",
                });
            }

            // Generate access token (short-lived)
            const accessToken = jwt.sign({ userId: dbUser.id }, "secretKey", { expiresIn: "1h" });
            
            // Generate refresh token (long-lived)
            const refreshToken = jwt.sign({ userId: dbUser.id }, "secretKey", { expiresIn: "7d" });

            // Update user's refresh token in database
            await dbUser.update({ token: refreshToken });

            return res.json({
                success: true,
                message: "Login successful",
                object: {
                    user: {
                        id: dbUser.id,
                        username: dbUser.username,
                        email: dbUser.email,
                        accessToken,
                        refreshToken
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}

// Register function
exports.register = async (req, res) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        // Validate input
        if (!username) {
            return res.status(400).json({
                success: false,
                error: "Username is required",
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                error: "Password is required",
            });
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required",
            });
        }

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{
                    username
                }, {
                    email
                }]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Username or email already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create new user

        // First create the user without token
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            resetToken: null
        });

        // Then create the token using the new user's ID
        const token = jwt.sign({
            userId: newUser.id
        }, "secretKey", {
            expiresIn: "8h"
        });
        console.log("token: ", token);

        // Update the user with the token
        await newUser.update({ token });

        res.status(200).json({
            success: true,
            message: "User registered successfully",
            object: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    token: newUser.token
                },
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;  // Change from id_user to id
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }

        const user = await User.findOne({
            where: {
                id: parseInt(id)  // Convert string to integer
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        // Delete the user
        await user.destroy();
        
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const resetToken = jwt.sign({ userId: user.id }, "resetSecretKey", { expiresIn: "1h" });
        await user.update({ resetToken });

        // Here you would typically send an email with reset link
        // For demo purposes, we'll just return the token
        res.json({
            success: true,
            message: "Password reset token generated",
            object: { resetToken }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        const decoded = jwt.verify(resetToken, "resetSecretKey");
        const user = await User.findOne({ where: { id: decoded.userId, resetToken } });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired reset token"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await user.update({ 
            password: hashedPassword,
            resetToken: null
        });

        res.json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                error: "Refresh token is required"
            });
        }

        const user = await User.findOne({ where: { token } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid refresh token"
            });
        }

        const newToken = jwt.sign({ userId: user.id }, "secretKey", { expiresIn: "8h" });
        await user.update({ token: newToken });

        res.json({
            success: true,
            message: "Token refreshed successfully",
            object: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    token: newToken
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Check if new username/email is already taken
        if (username || email) {
            const existingUser = await User.findOne({
                where: {
                    [Op.and]: [
                        { id: { [Op.ne]: id } },
                        { [Op.or]: [
                            username ? { username } : null,
                            email ? { email } : null
                        ].filter(Boolean) }
                    ]
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: "Username or email already exists"
                });
            }
        }

        await user.update({
            ...(username && { username }),
            ...(email && { email })
        });

        res.json({
            success: true,
            message: "Profile updated successfully",
            object: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};