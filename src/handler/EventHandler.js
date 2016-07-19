'use strict';


var AbstractHandler = require('./AbstractHandler'),
    extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
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
  };


  _this.destroy = function () {
    _initialize = null;
    _this = null;
  };

  _this.get = function (params) {
    return new Promise(function (resolve, reject) {
      // TODO: something way more intereseting
      resolve({
        event: 'event',
        params: params
      });
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = EventHandler;
