const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Payment = require('./Payment');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resetToken: {
      type: DataTypes.STRING,
      allowNull: true
  }
}, {
  timestamps: true
});

// Add association after model definition
User.hasMany(Payment, { foreignKey: 'userId' });

module.exports = User;