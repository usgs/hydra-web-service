'use strict';


var _DEFAULTS = {};


/**
 * Base class to define Handler API.
 *
 * A new handler is created for each request it handles.
 */
var AbstractHandler = function () {
  var _this;


  _this = {
    get: null,
    destroy: null
  };


  /**
   * Free references.
   */
  _this.destroy = function () {
    _this = null;
  };

  /**
   * Handle a get request.
   *
   * @param params {Object}
   *     query parameters for request.
   * @return {Promise}
   *     promise representing handling for this request.
   */
  _this.get = function (params) {
    return new Promise(function (/* resolve, reject */) {
      throw new Error('get not implemented');
    });
  };


  return _this;
};


module.exports = AbstractHandler;
