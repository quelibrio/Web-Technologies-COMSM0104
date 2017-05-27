'use strict';
const express = require('express');
const _ = require('lodash');

module.exports = function (app, responders, sequelize) {
    let Sequelize = sequelize.Sequelize;
    let DataTypes = Sequelize;
    const Recipe = sequelize.define('Recipe', {
            name: DataTypes.STRING,
            pictureLink: DataTypes.STRING,
            description: DataTypes.STRING,
            tip: DataTypes.STRING,
            timeRequired: DataTypes.DECIMAL
        },
        {
            timestamps: true,
            tableName: 'recipes',
            classMethods: {
                findRecipeByName: (name) => {
                    return Recipe.find({
                        where: Sequelize.where(Sequelize.fn('lower', Sequelize.col("name")), {
                            like: `%${name.toLowerCase().replace(' ', '')}%`
                        })
                    });
                },
                findRecipeById: (id) => {
                    return Recipe.find({
                        where: {
                            id
                        }
                    });
                }
            }
        });

    console.log('defined recipes tables');

    const recipesRouter = express.Router({mergeParams: true});

    recipesRouter.get('/name/:name', (req, res, next) => Recipe.findRecipeByName(req.params.name).then(responders.respondResult.bind(null, res)).catch(next));
    recipesRouter.get('/id/:id', (req, res, next) => Recipe.findRecipeById(req.params.id).then(responders.respondResult.bind(null, res)).catch(next));
    recipesRouter.post('/', (req, res, next) => Recipe.create(req.body).then(responders.respondResult.bind(null, res)).catch(next));

    app.use('/recipes', responders.checkAuthentication('user'), recipesRouter);
};