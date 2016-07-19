/* global __dirname */
'use strict';


var express = require('express'),
    extend = require('extend');


var _DEFAULTS = {
  MOUNT_PATH: '/ws/hydra',
  PORT: 8000
};


var HydraWebService = function (options) {
  var _this,
      _initialize,

      _mountPath,
      _port;


  _this = {};

  _initialize = function (options) {
    options = extend(true, {}, _DEFAULTS, options);

    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;
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
    var url;

    url = request.url.replace(_mountPath, '');
    if (url === '/event.json') {
      response.send('Hello from event.json');
      return;
    }

    next();
  };

  /**
   * Run hydra web service in an express server.
   */
  _this.start = function () {
    var app;

    app = express();

    app.get(_mountPath + '/:method', _this.get);

    app.use(_mountPath, express.static(__dirname + '/htdocs'));

    // TODO: implement server process
    console.log('hello from HydraWebService#start()');

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
