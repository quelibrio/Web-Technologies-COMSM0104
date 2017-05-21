'use strict';
let res;

function errorHandler(err, req, res, next) { //request handler with 4 params is an error handler
    console.error(err);
    res.status(400).send({message: err.message});
}

function notFound(req, res, next) {
    console.log(req.url, 'Not found');
    res.status(404).send({message: 'Endpoint not found'});
}

module.exports = function (app) {
    app.use(errorHandler);
    app.use(notFound);
};