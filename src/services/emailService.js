const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendResetEmail = async (email, resetToken) => {
    const resetUrl = `http://your-frontend-url/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
        `
    });
};

module.exports = { sendResetEmail };