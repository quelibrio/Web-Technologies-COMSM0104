'use strict';
var bodyParser = require('body-parser');

function handleCors(req, res, next) {
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
}

module.exports = function (app) {
    app.use(handleCors);
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.text());
};
