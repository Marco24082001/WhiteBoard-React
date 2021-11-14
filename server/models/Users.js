module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resetToken: {
        type: DataTypes.STRING,
      },
      expireToken: {
        type: DataTypes.DATE,
      }
    });
    
  
    Users.associate = (models) => {
      Users.hasMany(models.Boards, {
        onDelete: "cascade",
      });
    };
    return Users;
  };