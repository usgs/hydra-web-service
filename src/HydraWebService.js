/* global __dirname */
'use strict';


var EventMethod = require('./methods/EventMethod'),
    express = require('express'),
    extend = require('extend');


var _DEFAULTS = {
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
    start: null
  };

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;

    _this.eventMethod = EventMethod(options);
  };


  /**
   * Handle a dynamic get request.
   *
   * @param request {HTTPRequest}
   *     the http request.
   * @param response {HTTPResponse}
   *     the http response.
   * @param next {Middleware}
   *     next handler in the chain.
   */
  _this.get = function (request, response, next) {
    var method,
        format;

    method = request.params.method;
    format = request.params.format;

    if (method === 'event') {
      _this.eventMethod.get(request, response, next);
    } else {
      next();
    }
  };

  /**
   * Run hydra web service in an express server.
   */
  _this.start = function () {
    var app;

    app = express();

    // handle dynamic requests
    app.get(_mountPath + '/:method.:format', _this.get);

    // rest fall through to htdocs as static content.
    app.use(_mountPath, express.static(__dirname + '/htdocs'));

    app.listen(_port, function () {
      console.log('HydraWebService started');
      console.log('http://localhost:' + _port + _mountPath + '/');
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = HydraWebService;
