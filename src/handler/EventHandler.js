'use strict';


var AbstractHandler = require('./AbstractHandler'),
    extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
  factory: null
};


/**
 * Base class for web service methods.
 *
 * @param options {Object}
 *     configuration options.
 */
var EventHandler = function (options) {
  var _this,
      _initialize;


  _this = AbstractHandler();

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _this.factory = options.factory;
  };


  _this.destroy = function () {
    _initialize = null;
    _this = null;
  };

  _this.get = function (params) {
    if (!params.huid) {
      throw new Error('huid is a required parameter');
    }
    return _this.factory.getEvent(params.huid);
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = EventHandler;
