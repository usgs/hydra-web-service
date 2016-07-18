/* global describe, it */
'use strict';


var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon');


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
