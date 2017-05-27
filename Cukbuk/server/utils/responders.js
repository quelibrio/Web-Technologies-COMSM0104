'use strict';
const _ = require('lodash');
const passport = require('passport');

const responders = {
    respondRaw: function (res, data) {
        res.status(200).send(data);
    },
    ensureAuthenticated: function () {
        const args = Array.prototype.slice.call(arguments);
        let strategies;
        if (args.length > 0) {
            if (args.length === 1) {
                strategies = args[0];
            } else {
                strategies = args;
            }
            strategies = Array.isArray(strategies) ? strategies : [strategies];          //strategies is normalized to an array
        } else {
            strategies = null;
        }
        return function (req, res, next) {
            if (req.user) { //if already authorized
                next();
            } else {
                if (strategies) {
                    passport.authenticate(strategies, {session: false}, function (err, user, info) {
                        if (err) {
                            return next(err);
                        } else {
                            if (!user) {
                                return responders.respondUnauthorized(next);
                            }
                            req.user = user;
                            next();
                        }
                    })(req, res, next);
                } else {
                    return responders.respondUnauthorized(next);
                }
            }
        };
    },
    respondUnauthorized: function (next) {
        next(new Error('Unauthorized'));
    },
    parseResult: function (result) {
        if (result && result.toJSON) {
            result = result.toJSON();
        } else if (_.isArray(result)) {
            result = _.map(result, responders.parseResult);
        } else if (_.isObject(result)) {
            const jsonResult = {};
            _.forIn(result, function (val, key) {
                jsonResult[key] = responders.parseResult(val);
            });
            result = jsonResult;
        }
        return result;
    },
    /**
     *
     * @param res
     * @param [result=true]
     * @param [path]
     */
    respondResult: function (res, result, path) {
        result = responders.parseResult(result);
        if (path) {
            result = _.get(result, path);
        }
        result = result === undefined ? true : result;
        const data = {
            result: result
        };
        responders.respondRaw(res, data);
    },
    /**
     *
     * @param res
     * @param [path] responds with the path to a property of the result
     * @param [next] will next with an err as first argument if provided
     * @returns {Function} a function that is a handler of (err, result). Responds with error when there is an error and with a result when a result is available.
     */
    getResponder: function getResponder(res, path, next) {
        if (typeof path === 'function') {
            next = path;
            path = null;
        }

        return function baseResponder(err, result) {
            if (err) {
                next(err);
            } else {
                responders.respondResult(res, result, path);
            }
        };
    }
};
module.exports = responders;