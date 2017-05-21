//globals
'use strict';
const LocalStrategy = require('passport-local').Strategy;
module.exports = function (User) {
    return new LocalStrategy(function (username, password, done) {
        try {
            User.authorize({username, password}).then((user) => done(null, user, {
                strategy: 'user'
            }));
        } catch (err) {
            done(err);
        }
    });
};
