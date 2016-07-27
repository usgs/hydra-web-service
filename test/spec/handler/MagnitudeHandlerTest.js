/* global describe, it */
'use strict';


var chai = require('chai'),
    MagnitudeHandler = require('../../../src/handler/MagnitudeHandler'),
    sinon = require('sinon');


var expect = chai.expect;


describe('handler/MagnitudeHandler', function () {
  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof MagnitudeHandler).to.equal('function');
    });
  });

  describe('destroy', function () {
    it('can be called', function () {
      expect(function () {
        var obj;

        obj = MagnitudeHandler();
        obj.destroy();
      }).to.not.throw(Error);
    });
  });

  describe('get', function () {
    it('returns rejected promise if params is not set', function (done) {
      var handler;

      handler = MagnitudeHandler();
      handler.get({})
          .then(function () {
            // expect a rejected promise
            handler.destroy();
            done(false);
          })
          .catch(function (err) {
            expect(err.message).to.equal('Missing required parameter(s): huid, author, installation, magtype');
            handler.destroy();
            done();
          });
    });

    it('returns factory.getMagnitude with huid, author, installation, magtype',
      function () {
        var ev,
            factory,
            handler;

        ev = {};
        factory = {
          getMagnitude: sinon.stub().returns(ev)
        };
        handler = MagnitudeHandler({
          factory: factory
        });

        expect(handler.get({huid: 'test huid', author: 'test author',
          installation: 'test installation',
          magtype: 'test magtype'})).to.equal(ev);
        expect(factory.getMagnitude.calledOnce).to.equal(true);
        expect(factory.getMagnitude.getCall(0).args[0]).to.equal('test huid');
      });
  });
});
