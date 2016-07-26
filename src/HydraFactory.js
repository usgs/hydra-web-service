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
   * Free references.
   */
  _this.destroy = function () {
    _dsn = null;
    _password = null;
    _username = null;

    _initialize = null;
    _this = null;
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
      oracledb.outFormat = oracledb.OBJECT;
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
  _this.getEvent = function (huid) {
    return _this.getConnection().then(function (connection) {
      var sql;

      sql = `
          SELECT
              aei.idEvent,
              aei.huidEvent,
              aei.tiEventType,
              aei.iDubiocity,
              aei.bArchived,
              aei.fPubStatus,
              aei.iWeeklyTimeSlot,
              aei.dAnalystReviewPriority,
              aei.idPrefOrigin,
              aei.tOrigin,
              aei.dLat,
              aei.dLon,
              aei.dDepth,
              aei.iUsedPh,
              aei.iAssocPh,
              aei.sRegion,
              aei.idOriginAuthor,
              aei.sOriginAuthorName,
              aei.sOrAuthorInstCode,
              aei.idPrefMag,
              aei.dPrefMag,
              aei.iMagType,
              aei.iNumMags,
              aei.idMagAuthor,
              aei.smagAuthorName,
              aei.sMagAuthorInstCode,
              aei.idAuthorClaim,
              aei.sClaimAuthor,
              aei.sClaimAuthorHR,
              aei.sClaimInst,
              aei.tClaimed,
              aei.sOriginAuthorNameHR,
              aei.sQual,
              aei.PDENum,
              aei.iWorkflowStatus,
              aei.dValidProb,
              aei.iNumSummaryAdditions,
              aei.iNumSummaryUpdates,
              aei.iNumDatumAdditions,
              aei.iNumDatumUpdates,
              aei.tEventCreated,
              aei.iPubVersion,
              aei.idComment,
              aei.idInternalComment,
              aei.sEventType,
              am.sMagAbbrev
          FROM
              all_events_info aei
              JOIN all_magtypes am ON (am.iMagType = aei.iMagType)
          WHERE
              aei.huidEvent = :huid`;

      return connection.execute(sql, { huid: huid })
          .then(function (result) {
            var json;

            if (result.rows.length === 0) {
              throw new Error('event "' + huid + '" not found');
            }

            json = _this._parseEvent(result.rows[0]);

            return _this._getEventMagnitudes(connection, huid)
                .then(function (magnitudes) {
                  json.properties.magnitudes = magnitudes;
                  return json;
                });
          });
    });
  };

  /**
   * Fetch magnitude summaries for a specific event.
   *
   * @param connection {Connection}
   *     database connection.
   * @param huid {String}
   *     event id.
   * @return {Promise}
   *     promise that resolves into an Array of magnitude summary Objects.
   */
  _this._getEventMagnitudes = function (connection, huid) {
    var sql;

    sql = `
        SELECT
          amfeiw.huidevent,
          amfeiw.idMag,
          amfeiw.idActualMag,
          amfeiw.dMagAvg,
          amfeiw.iNumMags,
          amfeiw.stamag_count,
          amfeiw.dMagErr,
          amfeiw.iMagType,
          amfeiw.dMwMag,
          amfeiw.dMwError,
          amfeiw.dWeight,
          amfeiw.idAuthor,
          amfeiw.sName,
          amfeiw.sNameHR,
          amfeiw.iType,
          amfeiw.idCommentAuthor,
          amfeiw.idInst,
          amfeiw.sInstCode,
          amfeiw.sInstNameHR,
          amfeiw.idInstComment,
          amfeiw.idOrigin,
          amfeiw.idComment,
          amfeiw.sMagAbbrev
        FROM
          all_mags_for_event_info_wc amfeiw
        WHERE
          amfeiw.huidevent = :huid`;

    return connection.execute(sql, {huid: huid})
        .then(function (result) {
          return result.rows.map(_this._parseEventMagnitude);
        });
  };


  /**
   * Parse one magnitude summary row into an object.
   *
   * @param row {Object}
   *     object from magnitude summary query result.
   * @return {Object}
   *     magnitude summary object.
   * @see _this.getEvent
   */
  _this._parseEvent = function (row) {
    var eventSummary;

    eventSummary = {
      id: row.HUIDEVENT,
      properties: {
        eventtime: new Date(row.TORIGIN * 1000).toISOString(),
        magnitude: row.DPREFMAG,
        magnitudeType: row.SMAGABBREV,
        magnitudes: [],
        title: row.SREGION,
        type: row.SEVENTTYPE
      },
      geometry: {
        type: 'Point',
        coordinates: [
          row.DLON,
          row.DLAT,
          row.DDEPTH
        ]
      }
    };

    return eventSummary;
  };

  /**
   * Parse one magnitude summary row into an object.
   *
   * @param row {Object}
   *     object from magnitude summary query result.
   * @return {Object}
   *     magnitude summary object.
   * @see _this._getEventMagnitudes
   */
  _this._parseEventMagnitude = function (row) {
    var mag;

    mag = {
      author: row.SNAME,
      installation: row.SINSTCODE,
      type: row.SMAGABBREV,
      value: row.DMAGAVG
    };

    mag.id = [
      row.HUIDEVENT,
      mag.author,
      mag.installation,
      mag.type
    ].join('/');

    return mag;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = HydraFactory;
