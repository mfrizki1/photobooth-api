const { body, validationResult } = require('express-validator');

const registerValidation = [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
];

const loginValidation = [
    body('username').trim().notEmpty(),
    body('password').notEmpty(),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: "Validation error",
            message: errors.array()
        });
    }
    next();
};

const paymentValidation = [
    body('amount')
    .isNumeric()
    .withMessage('Amount must be a valid number')
    .isInt({ min: 1 })
    .withMessage('Amount must be at least 1'),

    body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
]

module.exports = {
    registerValidation,
    loginValidation,
    validate,
    paymentValidation
};