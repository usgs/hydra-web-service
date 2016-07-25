/* global afterEach, beforeEach, describe, it */
'use strict';

var chai = require('chai'),
    HydraWebService = require('../../src/HydraWebService'),
    sinon = require('sinon');


var expect = chai.expect;


describe('HydraWebService', function () {
  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof HydraWebService).to.equal('function');
    });
  });

  describe('destroy', function () {
    it('can be called', function () {
      expect(function () {
        var obj;

        obj = HydraWebService();
        obj.destroy();
      }).to.not.throw(Error);
    });
  });


  describe('get', function () {
    var service;

    beforeEach(function () {
      service = HydraWebService();
    });

    afterEach(function () {
      service.destroy();
      service = null;
    });

    it('calls next when no handler for method', function () {
      var next,
          request;

      next = sinon.spy();
      request = {
        params: {
          method: 'no such method'
        }
      };

      service.get(request, null, next);
      expect(next.calledOnce).to.equal(true);
    });

    it('creates handler and calls its get method', function () {
      var handler,
          request;

      handler = {
        get: sinon.stub().returns({
          then: function () {
            return this;
          },
          catch: function () {
            return this;
          }
        })
      };
      service.handlers['test handler'] = function () {
        return handler;
      };
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      service.get(request, null, null);
      expect(handler.get.calledOnce).to.equal(true);
      expect(handler.get.calledWith(request.query)).to.equal(true);
    });

    it('passes factory to handler constructor', function () {
      var factory,
          handler,
          request;

      handler = {
        get: sinon.stub().returns({
          then: function () {
            return this;
          },
          catch: function () {
            return this;
          }
        })
      };
      factory = sinon.stub().returns(handler);
      service.handlers['test handler'] = factory;
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      service.get(request, null, null);
      expect(factory.calledOnce).to.equal(true);
      expect(factory.getCall(0).args[0].factory).to.equal(service.factory);
    });

    it('calls onOk when handler promise resolves', function (done) {
      var args,
          data,
          handler,
          request;

      data = {};
      handler = {
        destroy: sinon.spy(),
        get: sinon.stub().returns(Promise.resolve(data))
      };
      service.handlers['test handler'] = function () {
        return handler;
      };
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      sinon.stub(service, 'onOk', function () {
        expect(service.onOk.calledOnce).to.equal(true);
        args = service.onOk.getCall(0).args;
        expect(args[0]).to.equal(data);
        expect(args[1]).to.equal(request);
        service.onOk.restore();
        done();
      });
      service.get(request);
    });

    it('calls onError when handler promise rejects', function (done) {
      var args,
          err,
          handler,
          request;

      err = new Error('test error');
      handler = {
        destroy: sinon.spy(),
        get: sinon.stub().returns(Promise.reject(err))
      };
      service.handlers['test handler'] = function () {
        return handler;
      };
      request = {
        params: {
          method: 'test handler'
        },
        query: {}
      };

      sinon.stub(service, 'onError', function () {
        expect(service.onError.calledOnce).to.equal(true);
        args = service.onError.getCall(0).args;
        expect(args[0]).to.equal(err);
        expect(args[1]).to.equal(request);
        service.onError.restore();
        done();
      });
      service.get(request);
    });
  });

  describe('onError', function () {
    it('calls response.status with 500 error code', function () {
      var response,
          service;

      response = {
        json: sinon.spy(),
        status: sinon.spy()
      };
      service = HydraWebService();

      service.onError(null, null, response);
      expect(response.status.calledOnce).to.equal(true);
      expect(response.status.calledWith(500)).to.equal(true);
      expect(response.json.getCall(0).args[0].error).to.equal(true);

      service.destroy();
    });
  });

  describe('onOk', function () {
    it('calls next when data is null', function () {
      var next,
          service;

      next = sinon.spy();
      service = HydraWebService();

      service.onOk(null, null, null, next);
      expect(next.calledOnce).to.equal(true);

      service.destroy();
    });

    it('calls response.json with data', function () {
      var arg,
          data,
          request,
          response,
          service;

      data = {};
      request = {
        originalUrl: 'test url'
      };
      response = {
        json: sinon.spy(),
        status: sinon.spy()
      };
      service = HydraWebService();

      service.onOk(data, request, response, null);
      arg = response.json.getCall(0).args[0];
      expect(arg.data).to.equal(data);
      expect(arg.error).to.equal(false);
      expect(typeof(arg.metadata.date)).to.equal('string');
      expect(arg.metadata.url).to.equal(request.originalUrl);

      service.destroy();
    });
  });
});
