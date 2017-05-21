'use strict';
const express = require('express');
const _ = require('lodash');

module.exports = function (sequelize, User) {
    let DataTypes = sequelize.Sequelize;
    const Game = sequelize.define('game', {
            field: DataTypes.STRING,
        },
        {
            timestamps: true,
            tableName: 'game',
            classMethods: {
                /**
                 * Authorizes a the user by email and password combination
                 * @returns {Promise}
                 * @param gameId
                 * @param posX
                 * @param posY
                 */
                move: function (gameId, posX, posY) {
                    return GameMove.create({
                        gameId,
                        posX,
                        posY
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
                    return _.pick(this, ['field', 'userId', 'id'])
                }
            }
        });

    const GameMove = sequelize.define('gameMove', {
            posX: DataTypes.INTEGER,
            posY: DataTypes.INTEGER
        },
        {
            timestamps: true,
            tableName: 'gameMoves'
        });

    GameMove.belongsTo(Game);
    GameMove.belongsTo(User);
    Game.belongsToMany(User, {through: 'multiplayer'});

    console.log('defined Game table');
    return {
        'gameApi': (app, responders) => {
            const gameRouter = express.Router({mergeParams: true});

            gameRouter.use('/:gameId', (req, res, next) => Game.findOne({where: {id: req.params.gameId}}).then((game) => {
                if (!game) {
                    return next(new Error('Game not found', req.params.gameId));
                }
                req.game = game;
                next();
            }).catch(next));

            gameRouter.post('', (req, res, next) => Game.create({
                field: req.body.field,
                userId: req.user.id
            }).then((r) => responders.respondResult(res, r)).catch(next));

            gameRouter.post('/:gameId/move/:moveId', (req, res, next) => GameMove.create({
                id: 1 + (+req.params.moveId),
                gameId: req.game.id,
                userId: req.user.id,
                posX: req.body.posX,
                posY: req.body.posY
            }).then((r) => responders.respondResult(res, r)).catch(next));

            gameRouter.get('/:gameId/after/:moveId', (req, res, next) => GameMove.findAndCountAll({
                where: {
                    gameId: req.game.id,
                    id: {
                        $gt: +req.params.moveId
                    }
                }
            }).then((r) => responders.respondResult(res, _.map(r.rows, _.partial(_.pick, _, ['posX', 'posY', 'userId'])))).catch(next));

            app.use('/game', responders.ensureAuthenticated('user'), gameRouter);

            console.log('registered game api /game');
        }
    };
};