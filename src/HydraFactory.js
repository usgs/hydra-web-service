'use strict';

var extend = require('extend'),
    oracledb;

// oracledb is configured as an optional dependency, wrap in try/catch
// (the instant client dependency is not so instant for automated processes)
try {
  oracledb = require('oracledb');
} catch (e) {
  oracledb = null;
}


var _DEFAULTS = {
  dsn: 'connectString',
  password: 'password',
  username: 'user'
};


/**
 * Factory for hydra backend information.
 *
 * @param options {Object}
 * @param options.dsn {String}
 *     database connection string, usually of the form "HOST/DBNAME".
 * @param options.password {String}
 *     database connection password.
 * @param options.username {String}
 *     database connection username.
 */
var HydraFactory = function (options) {
  var _this,
      _initialize,

      _dsn,
      _password,
      _username;


  _this = {};

  _initialize = function (options) {
    options = extend({}, _DEFAULTS, options);

    _dsn = options.dsn;
    _password = options.password;
    _username = options.username;
  };


  /**
   * Obtain database connection.
   *
   * @return {Promise}
   *     promise representing connection attempt:
   *     resolves with connection object when successful,
   *     rejects with error when unsuccessful.
   */
  _this.getConnection = function () {
    if (oracledb === null) {
      return Promise.reject(new Error('oracledb not installed'));
    } else {
      return oracledb.getConnection({
        connectString: _dsn,
        password: _password,
        user: _username
      });
    }
  };

  /**
   * Obtain information for specific event.
   *
   * @param huid {String}
   *     unique identifier for event.
   * @return {Promise}
   *     promise representing event information:
   *     resolves with Event object when successfully retrieved,
   *     rejects with Error when unsuccessful.
   */
  _this.getEvent = function (/*huid*/) {
    return _this.getConnection().then(function (/*connection*/) {
      // TODO: use connection to fetch event information
      return Promise.reject(new Error('getEvent not implemented'));
    });
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = HydraFactory;
