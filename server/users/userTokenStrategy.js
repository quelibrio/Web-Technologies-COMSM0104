//globals
'use strict';
const BearerStrategy = require('passport-http-bearer').Strategy;

module.exports = function (User) {
    return new BearerStrategy(function (token, done) {
        if (!token) {
            return done(new Error('No token provided'));
        }
        return User.findOne({where: {token: token}}).then((user) => {
            if (!user) {
                return done(null, false, new Error('Token doesn\'t match a logged user'));
            }
            return done(null, user, {
                strategy: 'user'
            });
        }).catch((err) => done(null, false, err));
    });
};
