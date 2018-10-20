'use strict';

const bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    const userModel = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
        },
        username: {
            type: DataTypes.TEXT, allowNull: false, unique: true
        },
        password: {
            type: DataTypes.TEXT, allowNull: false
        },
    }, {
        timestamps: false,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        hooks: {
            beforeCreate: function (user, options) {
                return bcrypt.hash(user.password, 10)
                    .then(function (hashedPassword) {
                        user.password = hashedPassword;
                    });
            }
        }
    });

    userModel.prototype.comparePassword = function(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.getDataValue('password'));
    };

    return userModel;
};
