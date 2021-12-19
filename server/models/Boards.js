'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Boards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Rooms, {onDelete: 'cascade', foreignKey: 'roomId'});
    }
  };
  Boards.init({
    dataUrl: DataTypes.TEXT('long')
  }, {
    sequelize,
    modelName: 'Boards',
  });
  return Boards;
};