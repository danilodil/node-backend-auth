/* eslint-disable no-unused-vars */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // await queryInterface.addColumn('Raters', 'url', { type: Sequelize.STRING },
      // { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
