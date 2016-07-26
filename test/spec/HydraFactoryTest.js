/* global describe, it */
'use strict';


var chai = require('chai'),
    HydraFactory = require('../../src/HydraFactory');


var expect = chai.expect;


describe('HydraFactory', function () {

  describe('constructor', function () {
    it('is a function', function () {
      expect(typeof HydraFactory).to.equal('function');
    });
  });

  describe('destroy', function () {
    it('can be called', function () {
      expect(function () {
        var obj;

        obj = HydraFactory();
        obj.destroy();
      }).to.not.throw(Error);
    });
  });

});
