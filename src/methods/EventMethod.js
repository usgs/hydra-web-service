'use strict';


var extend = require('extend');


var _DEFAULTS;

_DEFAULTS = {
};


/**
 * Base class for web service methods.
 *
 * @param options {Object}
 *     configuration options.
 */
var EventMethod = function (options) {
  var _this,
      _initialize;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);
  };


  _this.destroy = function () {
    _initialize = null;
    _this = null;
  };

  _this.get = function (request, response, next) {
    var result;

    try {
      result = _this.handleGet(request);
      if (result === null) {
        next();
        return;
      }
      response.json(result);
    } catch (e) {
      response.status(500);
      response.json({
        error: true,
        message: e.message
      });
    }
  };

  _this.handleGet = function (request) {
    return {
      'event': 123
    };
  };

  _initialize(options);
  options = null;
  return _this;
};


module.exports = EventMethod;
