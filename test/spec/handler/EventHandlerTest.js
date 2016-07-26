/* global describe, it */
'use strict';


var chai = require('chai'),
    EventHandler = require('../../../src/handler/EventHandler'),
    sinon = require('sinon');


var expect = chai.expect;


describe('handler/EventHandler', function () {
  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof EventHandler).to.equal('function');
    });
  });

  describe('destroy', function () {
    it('can be called', function () {
      expect(function () {
        var obj;

        obj = EventHandler();
        obj.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('get', function () {
    it('returns rejected promise if params.huid is not set', function (done) {
      var handler;

      handler = EventHandler();
      handler.get({})
          .then(function () {
            // expect a rejected promise
            handler.destroy();
            done(false);
          })
          .catch(function (err) {
            expect(err.message).to.equal('huid is a required parameter');
            handler.destroy();
            done();
          });
    });

    it('returns factory.getEvent with huid', function () {
      var ev,
          factory,
          handler;

      ev = {};
      factory = {
        getEvent: sinon.stub().returns(ev)
      };
      handler = EventHandler({
        factory: factory
      });

      expect(handler.get({huid: 'test huid'})).to.equal(ev);
      expect(factory.getEvent.calledOnce).to.equal(true);
      expect(factory.getEvent.getCall(0).args[0]).to.equal('test huid');
    });
  });
});
