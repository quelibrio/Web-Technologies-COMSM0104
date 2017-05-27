const users = require('./users/users');
const recipesApi = require('./recipes/recipesApi');
const responders = require('./utils/responders');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const express = require('express');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    storage: 'database.sqlite'
});

const ipAddress = 'localhost';
const port = 9999;

let app = express();
const server = require('http').Server(app);

if (ipAddress === 'localhost' || ipAddress === '127.0.0.1') { //for local development call with 2 parameters because 'localhost' as ipAddress doesn't work.
    server.listen(port, cb);
} else {
    server.listen(port, ipAddress, cb);
}

function cb(err) {
    if (err) {
        console.error('Server start error!', err);
        return;
    }
    console.log('Server started on ' + ipAddress + ':' + port + '.');
    sequelize
        .authenticate()
        .then(() => {
            console.log('Connection to database has been established successfully.');

            app.use((req, res, next) => {
                var respond = false;

                if (req.headers.origin) {
                    res.header('Access-Control-Allow-Origin', req.headers.origin);
                    respond = true;
                }

                if (req.headers['access-control-request-method']) {
                    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
                    respond = true;
                }

                if (req.headers['access-control-request-headers']) {
                    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
                    respond = true;
                }

                if (respond && req.method.toUpperCase() === 'OPTIONS') {
                    res.sendStatus(200);
                } else {
                    next();
                }
            });

            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
            app.use(bodyParser.text());

            app.get('/status', (req, res) => {
                res.status(200).send({result: new Date()});
            });

            let {usersPassport, authApi, User} = users(sequelize);
            usersPassport();

            authApi(app, responders);

            recipesApi(app, responders, sequelize);

            sequelize.sync({force: false}).then(() => console.log('CukBuk running!')).catch((err) => console.error(err));

            app.use(errorHandler);
            app.use(notFound);

            function errorHandler(err, req, res, next) {
                console.error(err);
                res.status(400).send({message: err.message});
            }

            function notFound(req, res, next) {
                console.log(req.url, 'Not found');
                res.status(404).send({message: 'Not found'});
            }
        })
        .catch(console.error);
}