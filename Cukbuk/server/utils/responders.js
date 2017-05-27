'use strict';
const _ = require('lodash');
const passport = require('passport');

const responders = {
    checkAuthentication: function (strategy) {
        return function (req, res, next) {
            if (req.user) { //if already authorized
                next();
            } else {
                if (strategy) {
                    passport.authenticate([strategy], {session: false}, function (err, user, info) {
                        if (err) {
                            return next(err);
                        } else {
                            if (!user) {
                                return next(new Error('Unauthorized'));
                            }
                            req.user = user;
                            next();
                        }
                    })(req, res, next);
                } else {
                    return next(new Error('Unauthorized'));
                }
            }
        };
    },
    /**
     *
     * @param res
     * @param result
     */
    respondResult: function (res, result) {
        const data = {
            result: result
        };
        res.status(200).send(data);
    }
};
module.exports = responders;