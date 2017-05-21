const expressApp = require('./bootstrap/expressApp');

expressApp((err, app) => {
    if (err) {
        console.error('Unable to start server:', err);
        return console.log('Server start error. Exiting now.');
    }

    app.get('/status', (req, res) => {
        res.status(200).send({result: new Date()});
    })
});