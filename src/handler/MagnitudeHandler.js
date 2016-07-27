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
   * @param params.magtype {String}
   *     requested magnitude type.
   * @return {Promise}
   *     promise that resolves with the requested event,
   *     or rejects with an error.
   */
  _this.get = function (params) {
    var errorMessage,
        errorString;

    errorMessage = 'Missing required parameter(s):';
    errorString = '';

    // check params for missing parameters
    // check huid
    if (!params.huid) {
      if (errorString !== '') {
        errorString = errorString.concat(', ');
      } else {
        errorString = errorString.concat(' ');
      }
      errorString = errorString.concat('huid');
    }

    // check author
    if (!params.author) {
      if (errorString !== '') {
        errorString = errorString.concat(', ');
      } else {
        errorString = errorString.concat(' ');
      }
      errorString = errorString.concat('author');
    }

    // check installation
    if (!params.installation) {
      if (errorString !== '') {
        errorString = errorString.concat(', ');
      } else {
        errorString = errorString.concat(' ');
      }
      errorString = errorString.concat('installation');
    }

    // check magtype
    if (!params.magtype) {
      if (errorString !== '') {
        errorString = errorString.concat(', ');
      } else {
        errorString = errorString.concat(' ');
      }
      errorString = errorString.concat('magtype');
    }

    // did we have missing parameter(s)
    if (errorString === '') {
      return _this.factory.getMagnitude(params.huid, params.author,
        params.installation, params.magtype);
    } else {
      return Promise.reject(new Error(errorMessage.concat(errorString)));
    }
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = MagnitudeHandler;
