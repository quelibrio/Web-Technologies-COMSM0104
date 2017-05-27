const expressApp = require('./bootstrap/expressApp');
const users = require('./users/users');
const recipes = require('./recipes/recipes');
const responders = require('./utils/responders');

expressApp((err, app, sequelize) => {
    if (err) {
        console.error('Unable to start server:', err);
        return console.log('Server start error. Exiting now.');
    }

    app.get('/status', (req, res) => {
        res.status(200).send({result: new Date()});
    });

    let {usersPassport, authApi, User} = users(sequelize);
    usersPassport();
    authApi(app, responders);

    recipes(sequelize, User).gameApi(app, responders);

    sequelize.sync({force: false}).then(() => console.log('Application running!')).catch((err) => {
        if (err) {
            return console.log('Unable to sync db:', err);
        }
    });
});