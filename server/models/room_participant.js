'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room_participant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, {foreignKey: 'userId'});
      this.belongsTo(models.Boards, {foreignKey: 'boardId'});
    }
  };
  Room_participant.init({
    boardId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Room_participant',
  });
  return Room_participant;
};