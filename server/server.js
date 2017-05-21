const expressApp = require('./bootstrap/expressApp');
const users = require('./users/users');
const responders = require('./utils/responders');

expressApp((err, app, sequelize) => {
    if (err) {
        console.error('Unable to start server:', err);
        return console.log('Server start error. Exiting now.');
    }

    app.get('/status', (req, res) => {
        res.status(200).send({result: new Date()});
    });

    let {usersPassport, authApi} = users(sequelize);
    usersPassport();
    authApi(app, responders);

    sequelize.sync().then(() => console.log('Application running!')).catch((err) => {
        if (err) {
            return console.log('Unable to sync db:', err);
        }
    });
});