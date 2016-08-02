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
   * Get a magnitude.
   *
   * @param params {Object}
   *     request parameters.
   * @param params.huid {String}
   *     requested magnitude event id.
   * @param params.author {String}
   *     requested magnitude author.
   * @param params.installation {String}
   *     requested magnitude installation.
   * @param params.type {String}
   *     requested magnitude type.
   * @return {Promise}
   *     promise that resolves with the requested event,
   *     or rejects with an error.
   */
  _this.get = function (params) {
    var missing;

    missing = [];

    // check params for missing parameters
    // check author
    if (!params.author) {
      missing.push('author');
    }

    // check huid
    if (!params.huid) {
      missing.push('huid');
    }

    // check installation
    if (!params.installation) {
      missing.push('installation');
    }

    // check type
    if (!params.type) {
      missing.push('type');
    }

    // did we have missing parameter(s)
    if (missing.length > 0) {
      return Promise.reject(new Error(
          'Missing required parameter' + (missing.length > 1 ? 's' : '') +
          ': ' + missing.join(', ')));
    }

    return _this.factory.getMagnitude(params.huid, params.author,
        params.installation, params.type);
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MagnitudeHandler;
