/* global describe, it */
'use strict';


var chai = require('chai'),
    sinon = require('sinon');


var expect;

expect = chai.expect;


describe('ExampleTest', function () {

  describe('test framework', function () {
    it('includes chai', function () {
      expect(typeof chai).to.equal('object');
    });

    it('includes sinon', function () {
      expect(typeof sinon).to.equal('object');
    });
  });

});
