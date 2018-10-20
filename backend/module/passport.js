'use strict';

const Promise = require('bluebird');
const passport = require('passport');

const User = require('./sequelize').models.User;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

// Create local strategy
const localOptions = {
    usernameField: 'username',
    passwordField: 'password'
};

const localLogin = new LocalStrategy(localOptions, function (username, password, done) {
    const query = {
        where: { username }
    };

    User.findOne(query)
        .then(function (user) {
            if (!user) {
                return done(null, false);
            } else {
                return Promise.all([user.comparePassword(password), user]);
            }
        })
        .then(function (res) {
            if (res[0]) {
                delete res[1].dataValues.password;
                return done(null, res[1]);
            } else {
                return done(null, false);
            }
        })
        .catch(function (err) {
            err.status = 401;
            return done(err);
        });
});

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_KEY
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    const query = {
        where: {
            id: payload.sub
        }
    };

    User.findOne(query)
        .then(function (user) {
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        })
        .catch(function (err) {
            err.status = 401;
            return done(err);
        });
});

// Tell passport to use above strategies
passport.use(jwtLogin);
passport.use(localLogin);

module.exports = passport;