/* global afterEach, beforeEach, chai, describe, it */
'use strict';

var chai = require('chai'),
    EventMethod = require('../../../src/methods/EventMethod'),
    sinon = require('sinon');


var expect = chai.expect;


describe('methods/EventMethod', function () {
  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof EventMethod).to.equal('function');
    });
  });

  describe('destroy', function () {
    it('can be called', function () {
      expect(function () {
        var obj;

        obj = EventMethod();
        obj.destroy();
      }).to.not.throw(Error);
    });
  });


  describe('get', function () {
    var method,
        next,
        request,
        response;

    beforeEach(function () {
      method = EventMethod();
      next = sinon.spy();
      request = {};
      response = {
        json: sinon.spy(),
        status: sinon.spy()
      };
    });

    afterEach(function () {
      method.destroy();
      method = null;
      next = null;
      request = null;
      response = null;
    });

    it('calls handleGet with request', function () {
      var result;

      result = {};
      // make handle get return a known result
      sinon.stub(method, 'handleGet', function () {
        return result;
      });

      method.get(request, response, next);

      expect(method.handleGet.calledOnce).to.equal(true);
      expect(method.handleGet.calledWith(request)).to.equal(true);

      method.handleGet.restore();
    });

    it('calls next when result is null', function () {
      // make handle get return a known result
      sinon.stub(method, 'handleGet', function () {
        return null;
      });

      method.get(request, response, next);

      expect(next.calledOnce).to.equal(true);

      method.handleGet.restore();
    });

    it('calls response.json() when result is not null', function () {
      var result;

      result = {};
      // make handle get return a known result
      sinon.stub(method, 'handleGet', function () {
        return result;
      });

      method.get(request, response, next);

      expect(response.json.calledOnce).to.equal(true);
      expect(response.json.calledWith(result)).to.equal(true);
      expect(response.status.callCount).to.equal(0);
      method.handleGet.restore();
    });

    it('calls response.status with 500 when exception caught', function () {
      var json;

      // make handle get return a known result
      sinon.stub(method, 'handleGet', function () {
        throw new Error('test message');
      });

      method.get(request, response, next);

      expect(response.status.calledOnce).to.equal(true);
      expect(response.status.calledWith(500)).to.equal(true);
      json = response.json.getCall(0).args[0];
      expect(json.error).to.equal(true);
    });
  });

});
