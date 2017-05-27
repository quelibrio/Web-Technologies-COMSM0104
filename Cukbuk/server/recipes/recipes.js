'use strict';
const express = require('express');
const _ = require('lodash');

module.exports = function (sequelize, User) {
    let DataTypes = sequelize.Sequelize;
    const Recipe = sequelize.define('Recipe', {
            field: DataTypes.STRING,
            image: DataTypes.INTEGER,
            ingridient: DataTypes.INTEGER
        },
        {
            timestamps: true,
            tableName: 'recipes',
            classMethods: {
                move: function (gameId, posX, posY) {
                    return GameMove.create({
                        gameId,
                        posX,
                        posY
                    });
                }
            },
            instanceMethods: {
                toJSON: function () {
                    return _.pick(this, ['field', 'userId', 'id', 'createdAt'])
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

    GameMove.belongsTo(Recipe);
    GameMove.belongsTo(User);

    Recipe.belongsToMany(User, {through: 'multiplayer'});

    console.log('defined recipes tables');
    return {
        'gameApi': (app, responders) => {
            const gameRouter = express.Router({mergeParams: true});

            gameRouter.get('/highscore', (req, res, next) => GameMove.findAll({
                order: [['posX', 'DESC']],
                include: [{model: User, required: true}],
                limit: 10
            }).then((gameMoves) => _.map(gameMoves, (gm) => ({
                name: gm.user.username,
                moves: gm.posX
            }))).then(responders.respondResult.bind( null, res)).catch(next));

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

            gameRouter.post('/:gameId/move/:moveId', (req, res, next) => GameMove.findOne({
                where: {
                    gameId: req.game.id,
                    id: {
                        $gt: req.params.moveId
                    }
                }
            }).then((r) => {
                if (r) {
                    next(new Error('Update state.'))
                } else {
                    GameMove.create({
                        gameId: req.game.id,
                        userId: req.user.id,
                        posX: req.body.posX,
                        posY: req.body.posY
                    }).then((r) => responders.respondResult(res, r)).catch(next)
                }
            }));

            gameRouter.get('/:gameId/after/:moveId', (req, res, next) => GameMove.findAndCountAll({
                where: {
                    gameId: req.game.id,
                    id: {
                        $gt: +req.params.moveId
                    }
                }
            }).then((r) => responders.respondResult(res, _.chain(r.rows).map(_.partial(_.pick, _, ['posX', 'posY', 'userId', 'createdAt', 'id'])).sortBy('id').value()))
                .catch(next));


            app.use('/game', responders.ensureAuthenticated('user'), gameRouter);

            console.log('registered game api /game');
        }
    };
};