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
   * Obtain information for specific magnitude.
   *
   * @param huid {String}
   *     unique identifier for event.
   * @param author {String}
   *     unique identifier for magnitude author.
   * @param installation {String}
   *     unique identifier for mangitude author installation.
   * @param magtype {String}
   *     unique identifier for magnitude type.
   * @return {Promise}
   *     promise representing magnitude information:
   *     resolves with Magnitude object when successfully retrieved,
   *     rejects with Error when unsuccessful.
   */
  _this.getMagnitude = function (huid, author, installation, magtype) {
    return _this.getConnection().then(function (connection) {
      var sql;

      sql = `
          SELECT
            amfeiw.idMag,
            amfeiw.idActualMag,
            amfeiw.dMagAvg,
            amfeiw.iNumMags,
            amfeiw.stamag_count,
            amfeiw.dMagErr,
            amfeiw.iMagType,
            amfeiw.sMagAbbrev,
            amfeiw.dMwMag,
            amfeiw.dMwError,
            amfeiw.dWeight,
            decode(zero_if_null(pmbt.idbind),pmbt.idbind,1,0) bPreferredByType,
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
            amfeiw.idEvent,
            amfeiw.huidEvent,
            amfeiw.idComment,
            aai.idAuthor idAssocAuthor,
            aai.sName sAssocName,
            aai.sNameHR sAssocNameHR,
            aai.iType iAssocType,
            aai.idInst idAssocInst,
            aai.sInstCode sAssocInstCode,
            aai.sInstNameHR sAssocInstNameHR
          FROM
            all_mags_for_event_info_wc amfeiw
            JOIN preferred_mags_by_type pmbt ON (pmbt.idMag = amfeiw.idMag)
            JOIN all_bind_info abi ON (amfeiw.idBind = abi.idBind)
            JOIN all_author_info aai ON (abi.idAuthor = aai.idAuthor)
          WHERE
            amfeiw.huidEvent = :huid
            AND amfeiw.sName = :author
            AND amfeiw.sInstCode = :installation
            AND amfeiw.sMagAbbrev = :magtype
            AND amfeiw.idBind = pmbt.idBind`;

      return connection.execute(sql, { huid: huid, author: author,
        installation: installation, magtype: magtype })
          .then(function (result) {
            var json;

            if (result.rows.length === 0) {
              throw new Error('magnitude "' + [huid, author, installation,
                magtype].join('/') + '" not found');}

            json = _this._parseMagnitude(result.rows[0]);

            return _this._getMagnitudeMomentTensor(connection,
                result.rows[0].IDMAG, true).then(function (momentTensor) {
                  json.properties.momentTensors = momentTensor;
                  return json;
                });
          });
    });
  };

  /**
   * Fetch moment tensor for a specific magnitude.
   *
   * @param connection {Connection}
   *     database connection.
   * @param idmag {Integer}
   *     magnitude id.
   * @param getPref {Boolean}
   *     flag indicating whether to only get the preferred moment tensor
   * @return {Promise}
   *     promise representing magnitude moment tensor information:
   *     resolves with moment tensor object when successfully retrieved,
   *     rejects with Error when unsuccessful.
   */
  _this._getMagnitudeMomentTensor = function (connection, idMag, getPref) {
    var sql;

    sql = `
        SELECT
          amws.idMw,
          amws.dLat,
          amws.dLon,
          amws.dDepth,
          amws.tOrigin,
          amws.idOrigin,
          amws.iNumStations,
          amws.dPFPStrike,
          amws.dPFPDip,
          amws.dPFPRake,
          amws.dAFPStrike,
          amws.dAFPDip,
          amws.dAFPRake,
          amws.idMag,
          amws.IterationIdMag,
          amws.dM0,
          amws.iScalarExp,
          amws.dMisfit,
          amws.dPercentDC,
          amws.dPercentCLVD,
          amws.dmXX,
          amws.dmXY,
          amws.dmXZ,
          amws.dmYY,
          amws.dmYZ,
          amws.dmZZ,
          amws.idMwFilter,
          amws.dLowCutHz,
          amws.dLowTaperHz,
          amws.dHighCutHz,
          amws.dHighTaperHz,
          amws.idMwFilterS,
          amws.dLowCutHzS,
          amws.dLowTaperHzS,
          amws.dHighCutHzS,
          amws.dHighTaperHzS,
          amws.dMisfitVR,
          amws.iMagType,
          amws.idBBDepth,
          amws.iMethod,
          amws.idSTF,
          amws.dSrcTime1,
          amws.dSrcTime2,
          amws.dSrcTime3,
          amws.idMwInput,
          amws.MwIn_iMagType,
          amws.MwIn_idAuthor,
          amws.MwIn_sAuthorName,
          amws.MwIn_sAuthorNameHR,
          amws.MwIn_iAuthorType,
          amws.MwIn_idInst,
          amws.MwIn_sInstCode,
          amws.iGap,
          amws.dMinEigenValue,
          amws.dMaxEigenValue
        FROM
          all_mw_solns_for_origin_xtrm amws
        WHERE
          amws.IterationIdMag = :idMag `;

    // if we're only getting the preferred solution
    if (getPref === true) {
      sql += 'AND amws.idMag = :idMag';
    }

    return connection.execute(sql, {idMag: idMag})
        .then(function (result) {
          // not all magnitudes have a moment tensor
          if (result.rows.length === 0) {
            return null;}
          else if (result.rows.length === 1) {
            return _this._parseMagnitudeMomentTensor(result.rows[0]);}
          else {
            return result.rows.map(_this._parseMagnitudeMomentTensor);}
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
   * Parse one event summary row into an object.
   *
   * @param row {Object}
   *     object from event summary query result.
   * @return {Object}
   *     event summary object.
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
   * Parse one magnitude row into an object.
   *
   * @param row {Object}
   *     object from magnitude query result.
   * @return {Object}
   *     magnitude object.
   * @see _this.getMagnitude
   */
  _this._parseMagnitude = function (row) {
    var mag,
        internal;

    // is author internal? check author type bit mask
    // AuthorTypeFlags::Internal = 1024
    if ((row.ITYPE & 1024) != 0) {
      internal = true;
    }
    else {
      internal = false;
    }

    // todo: need to get publishable from author +
    //   business rules

    mag = {
      properties: {
        'associated-by': row.SASSOCNAME,
        'associated-by-installation': row.SASSOCINSTCODE,
        'author': row.SNAME,
        'derived-magnitude': row.DMAGAVG,
        'derived-magnitude-type': row.SMAGABBREV,
        'installation': row.SINSTCODE,
        'is-internal': internal,
        'is-preferred-for-type': Boolean(row.BPREFERREDBYTYPE),
        'num-stations-associated': row.STAMAG_COUNT,
        'num-stations-used': row.INUMMAGS,
      },
      geometry: null,
      type: 'Feature'
    };

    mag.id = [
      row.HUIDEVENT,
      row.SNAME,
      row.SINSTCODE,
      row.SMAGABBREV
    ].join('/');

    return mag;
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

  /**
   * Parse one moment tensor row into an object.
   *
   * @param row {Object}
   *     object from moment tensor query result.
   * @return {Object}
   *     moment tensor object.
   * @see _this._getMagnitudeMomentTensor
   */
  _this._parseMagnitudeMomentTensor = function (row) {
    var mt,
        preferred,
        scalarExponent,
        moment,
        mpp,
        mrp,
        mrr,
        mrt,
        mtp,
        mtt;

    if (row.IDMAG > 0){
      preferred = true;
    }
    else {
      preferred = false;
    }

    // convert scalar exponent from dyne-cm to newton-meters (10^-7)
    scalarExponent = Math.pow(10, (row.ISCALAREXP - 7));

    // moment data in hydra is stored seperatly from the scalar exponent
    moment = row.DM0 * scalarExponent;

    // apply XYZ to TPR conversion
    mpp = row.DMYY * scalarExponent;
    mrp = row.DMYZ * scalarExponent * -1;
    mrr = row.DMZZ * scalarExponent;
    mrt = row.DMXZ * scalarExponent;
    mtp = row.DMXY * scalarExponent * -1;
    mtt = row.DMXX * scalarExponent;

    // todo:
    // need to generate ntp axis
    // need to convert sourcetime

    mt = {
      properties: {
        'azimuthal-gap': row.IGAP,
        'condition': row.DMAXEIGENVALUE / row.DMINEIGENVALUE,
        'derived-depth': row.DDEPTH,
        'derived-eventtime': new Date(row.TORIGIN * 1000).toISOString(),
        'derived-latitude': row.DLAT,
        'derived-longitude': row.DLON,
        'fit': row.DMISFIT,
        'nodal-plane-1-dip': row.DPFPDIP,
        'nodal-plane-1-slip': row.DPFPRAKE,
        'nodal-plane-1-strike': row.DPFPSTRIKE,
        'nodal-plane-2-dip': row.DAFPDIP,
        'nodal-plane-2-slip': row.DAFPRAKE,
        'nodal-plane-2-strike': row.DAFPSTRIKE,
        'percent-double-couple': row.DPERCENTDC/100,
        'num-stations-associated': row.STAMAG_COUNT,
        'num-stations-used': row.INUMMAGS,
        'scalar-moment': moment.toExponential(),
        'tensor-mpp': mpp.toExponential(),
        'tensor-mrp': mrp.toExponential(),
        'tensor-mrr': mrr.toExponential(),
        'tensor-mrt': mrt.toExponential(),
        'tensor-mtp': mtp.toExponential(),
        'tensor-mtt': mtt.toExponential(),
        'variance-reduction' : row.DMISFITVR,
        'preferred-solution' : preferred
      },
      geometry: {
        type: 'Point',
        coordinates: [
          row.DLON,
          row.DLAT,
          row.DDEPTH
        ]
      },
      type: 'Feature'
    };

    return mt;
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = HydraFactory;
