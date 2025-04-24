'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, add the column as nullable
    await queryInterface.addColumn('Payments', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,  // temporarily allow null
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    // Get the first user's ID to assign to existing payments
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" LIMIT 1;`
    );
    const defaultUserId = users[0]?.id || 1;

    // Update existing records
    await queryInterface.sequelize.query(
      `UPDATE "Payments" SET "userId" = ${defaultUserId} WHERE "userId" IS NULL;`
    );

    // Now make the column non-nullable
    await queryInterface.changeColumn('Payments', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Payments', 'userId');
  }
};