'use strict';

const Sequelize = require('sequelize');

const db = {};

const sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_ID,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
        //logging option
        , logging: function (log) {
            // console.log(log);
        }
    }
);

const User = sequelize.import('../model/user');

db.sequelize = sequelize;
db.models = {};

db.models.User = User;

module.exports = db;