module.exports = (sequelize, DataTypes) => {
    const Boards = sequelize.define("Boards", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        room: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dataUrl: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
    });
    return Boards;
};