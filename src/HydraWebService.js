/* global __dirname */
'use strict';


var EventHandler = require('./handler/EventHandler'),
    express = require('express'),
    extend = require('extend'),
    HydraFactory = require('./HydraFactory');


var _DEFAULTS = {
  DB_DSN: null,
  DB_USER: null,
  DB_PASS: null,
  MOUNT_PATH: '/ws/hydra',
  PORT: 8000
};


/**
 * Entry point for Hydra web service.
 *
 * Call start() method to run service in an express server.
 *
 * @param options {Object}
 * @param options.MOUNT_PATH {String}
 *     default '/ws/hydra'.
 *     site-root relative path to web service.
 * @param options.PORT {Number}
 *     default 8000.
 *     server port.
 */
var HydraWebService = function (options) {
  var _this,
      _initialize,

      _mountPath,
      _port;


  _this = {
    get: null,
    handlers: null,
    onError: null,
    onOk: null
  };

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;

    _this.factory = HydraFactory({
      dsn: options.DB_DSN,
      password: options.DB_PASS,
      username: options.DB_USER
    });

    _this.handlers = {
      'event.json': EventHandler
    };
  };


  _this.destroy = function () {
    _mountPath = null;
    _port = null;
    _this.handlers = null;
    _this = null;
  };


  /**
   * Handle a dynamic get request.
   *
   * Routes to appropriate handler (see handleGet),
   * or calls next() if no handler matches the requested method.
   *
   * @param request {HTTPRequest}
   *     the http request.
   * @param response {HTTPResponse}
   *     the http response.
   * @param next {Middleware}
   *     next handler in the chain.
   */
  _this.get = function (request, response, next) {
    var handler,
        method;

    // method is configured route parameter
    method = request.params.method;
    if (!(method in _this.handlers)) {
      next();
      return;
    }

    try {
      handler = _this.handlers[method]({
        factory: _this.factory
      });
      // start processing
      handler.get(request.query)
          // process successful result
          .then(function (data) {
            _this.onOk(data, request, response, next);
          })
          // handle any processing errors
          .catch(function (err) {
            _this.onError(err, request, response, next);
          })
          // finally, clean up
          .then(function () {
            handler.destroy();
            handler = null;
          });
    } catch (e) {
      // error creating/starting handler
      _this.onError(e, request, response, next);
    }
  };

  /**
   * Handle an error.
   *
   * @param err {Error}
   *     the Error that occured.
   * @param request {Request}
   *     the associated request.
   * @param response {Response}
   *     the associated response.
   * @param next {Function}
   *     call to pass request to next handler.
   */
  _this.onError = function (err, request, response/*, next*/) {
    if (request) {
      process.stderr.write('url=' + request.originalUrl);
    }
    if (err && err.stack) {
      process.stderr.write(err.stack);
    }

    response.status(500);
    response.json({
      error: true,
      message: (err && err.message) ? err.message : 'internal server error'
    });
  };

  /**
   * Handle an result without errors.
   *
   * @param data {Object}
   *     response data.
   *     when null, pass request to next handler.
   * @param request {Request}
   *     the associated request.
   * @param response {Response}
   *     the associated response.
   * @param next {Function}
   *     call to pass request to next handler.
   */
  _this.onOk = function (data, request, response, next) {
    if (data === null) {
      next();
      return;
    }
    response.json({
      data: data,
      error: false,
      metadata: {
        date: new Date().toISOString(),
        url: request.originalUrl
      }
    });
  };


  /**
   * Run hydra web service in an express server.
   */
  _this.start = function () {
    var app;

    app = express();

    // handle dynamic requests
    app.get(_mountPath + '/:method', _this.get);

    // rest fall through to htdocs as static content.
    app.use(_mountPath, express.static(__dirname + '/htdocs'));

    app.listen(_port, function () {
      process.stderr.write('HydraWebService listening ' +
          'http://localhost:' + _port + _mountPath + '/\n');
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = HydraWebService;
