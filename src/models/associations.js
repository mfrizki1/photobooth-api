const User = require('./User');
const Payment = require('./Payment');
const Image = require('./Image');

// Define associations
const setupAssociations = () => {
    User.hasMany(Payment, { foreignKey: 'userId' });
    Payment.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(Image);
    Image.belongsTo(User);
};

module.exports = setupAssociations;