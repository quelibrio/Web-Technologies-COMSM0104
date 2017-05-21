'use strict';
const Sequelize = require('sequelize');
const express = require('express');
const setupBeforeRequest = require('./setupBeforeRequest');
const setupAfterRequest = require('./setupAfterRequest');

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

const startServer = function (done) {
    let app = express();
    const server = require('http').Server(app);

    if (ipAddress === 'localhost' || ipAddress === '127.0.0.1') { //for local development call with 2 parameters because 'localhost' as ipAddress doesn't work.
        server.listen(port, cb);
    } else {
        server.listen(port, ipAddress, cb);
    }

    setupBeforeRequest(app);
    function cb(err) {
        if (err) {
            console.error('Server start error!', err);
            return done(err);
        }
        console.log('Server started on ' + ipAddress + ':' + port + '.');
        sequelize
            .authenticate()
            .then(() => {
                console.log('Connection to database has been established successfully.');
                done(null, app, sequelize);
                setupAfterRequest(app);
            })
            .catch(done);
    }
};

module.exports = startServer;