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
var MagnitudeHandler = function (options) {
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
   *     requested magnitude event id.
   * @param params.author {String}
   *     requested magnitude author.
   * @param params.installation {String}
   *     requested magnitude installation.
   * @param params.magtype {String}
   *     requested magnitude type.
   * @return {Promise}
   *     promise that resolves with the requested event,
   *     or rejects with an error.
   */
  _this.get = function (params) {
    if (!params.huid) {
      return Promise.reject(new Error('huid is a required parameter'));
    }
    else if (!params.author) {
      return Promise.reject(new Error('author is a required parameter'));
    }
    else if (!params.installation) {
      return Promise.reject(new Error('installation is a required parameter'));
    }
    else if (!params.magtype) {
      return Promise.reject(new Error('magtype is a required parameter'));
    }
    return _this.factory.getMagnitude(params.huid, params.author,
      params.installation, params.magtype);
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MagnitudeHandler;
