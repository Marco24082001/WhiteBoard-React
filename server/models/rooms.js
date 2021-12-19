'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rooms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Users, { onDelete: 'cascade', foreignKey: 'userId' });
      this.hasMany(models.Boards, { foreignKey: 'roomId' });
      this.hasMany(models.Room_participant, { foreignKey: 'roomId' });
    }
  };
  Rooms.init({
    title: DataTypes.STRING,
    roomId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Rooms',
  });
  return Rooms;
};