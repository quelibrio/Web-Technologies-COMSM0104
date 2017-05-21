'use strict';
const express = require('express');
const crypto = require('crypto');
const _ = require('lodash');
const saltLength = 50;
const passport = require('passport');

module.exports = function (sequelize) {
    let DataTypes = sequelize.Sequelize;
    const User = sequelize.define('user', {
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                set: function (plainPassword) {
                    this.setDataValue('salt', crypto.randomBytes(saltLength).toString('hex'));
                    this.setDataValue('password', this.encryptPassword(plainPassword));
                }
            },
            salt: DataTypes.STRING,
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            token: {
                type: DataTypes.STRING,
                defaultValue: () => crypto.randomBytes(56).toString('hex')
            }
        },
        {
            timestamps: true,
            tableName: 'user',
            classMethods: {
                /**
                 * Authorizes a the user by email and password combination
                 * @param [password]
                 * @param [username]
                 * @returns {Promise}
                 */
                authorize: function ({username, password}) {
                    return User.findOne({
                        username
                    }).then(function (foundUser) {
                        if (!foundUser) {
                            throw new Error('User not found');
                        } else if (password && !foundUser.authenticate(password)) {
                            throw new Error('Incorrect password');
                        } else {
                            return foundUser;
                        }
                    });
                }
            },
            instanceMethods: {
                encryptPassword: function (plainPassword) {
                    return crypto
                        .createHmac('sha512', this.salt)
                        .update(plainPassword)
                        .digest('hex');
                },
                authenticate: function (password) {
                    return this.password === this.encryptPassword(password);
                },
                toJSON: function () {
                    return _.pick(this, ['username', 'token'])
                }
            }
        });

    console.log('defined User table');
    return {
        User,
        'authApi': (app, responders) => {
            const authRouter = express.Router({mergeParams: true});

            authRouter.post('/login', responders.ensureAuthenticated('userLogin'), (req, res) => responders.respondResult(res, req.user));
            authRouter.get('/me', responders.ensureAuthenticated('user'), (req, res) => responders.respondResult(res, req.user));
            authRouter.post('/register', (req, res, next) => User.create(_.pick(req.body, ['username', 'password']))
                .then(user => responders.respondResult(res, user))
                .catch(next));
            app.use('/auth', authRouter);
            console.log('registered auth api /auth');
        },
        'usersPassport': () => {
            const userLoginStrategy = require('./userLoginStrategy');
            const userTokenStrategy = require('./userTokenStrategy');

            passport.use('userLogin', userLoginStrategy(User));
            passport.use('user', userTokenStrategy(User));
            console.log('registered user passport strategies');
        }
    };
};