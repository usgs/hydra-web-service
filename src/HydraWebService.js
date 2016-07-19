/* global __dirname */
'use strict';


var express = require('express');


var _DEFAULTS = {};


var HydraWebService = function (options) {
  var _this,
      _initialize,

      _mountPath,
      _port;


  _this = {};

  _initialize = function (options) {
    options = options || {};

    _mountPath = options.MOUNT_PATH;
    _port = options.PORT;
  };


  _this.get = function (request, response) {

  };

  _this.start = function () {
    var app;

    app = express();
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
