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


  /**
   * Free references.
   */
  _this.destroy = function () {
    _initialize = null;
    _this = null;
  };

  /**
   * Get an event.
   *
   * @param params {Object}
   *     request parameters.
   * @param params.huid {String}
   *     requested event id.
   * @return {Promise}
   *     promise that resolves with the requested event,
   *     or rejects with an error.
   */
  _this.get = function (params) {
    if (!params || !params.huid) {
      return Promise.reject(new Error('huid is a required parameter'));
    }
    return _this.factory.getEvent(params.huid);
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = EventHandler;
