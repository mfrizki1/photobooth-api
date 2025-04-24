const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        jwt.verify(token, "secretKey", (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        error: 'Token expired',
                        isExpired: true
                    });
                }
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};