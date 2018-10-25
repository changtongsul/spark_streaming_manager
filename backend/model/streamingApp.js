'use strict';

module.exports = function(sequelize, DataTypes) {

    const appModel = sequelize.define('streaming_app', {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
        },
        appName: {
            type: DataTypes.TEXT, allowNull: false, unique: true
        },
        appId: {
            type: DataTypes.TEXT, allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true
    });

    return appModel;
}