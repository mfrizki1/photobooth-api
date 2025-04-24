const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'),
        defaultValue: 'PENDING'
    },
    paymentUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    transaction_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fraud_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

module.exports = Payment;