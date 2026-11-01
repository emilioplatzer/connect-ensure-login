"use strict";

var assert = require('assert');

function MockRequest() {
  this.session = {};
  this.session.save = function(cb) { cb(); };
  this.method = 'GET';
}

function MockResponse() {
  this.headers = {};
}

MockResponse.prototype.setHeader = function(name, value) {
  this.headers[name] = value;
}

MockResponse.prototype.redirect = function(location) {
  this._redirect = location;
}

/**
 * Returns a function that receives a case and returns the body of a test (to pass to `it`).
 * The test runs the middleware with a mock request and checks how it ends.
 * Each case has:
 *   - `request`        properties of the request (url, originalUrl, xhr, method)
 *   - `authenticated`  the result of req.isAuthenticated(); if absent the request lacks that function
 *   - `redirect`       where it must redirect; if absent it must call next
 *   - `returnTo`       (optional) the expected req.session.returnTo
 */
function getTestMiddleware(mw) {
  return function testMiddleware(oneCase) {
    return function() {
      var req = new MockRequest();
      Object.assign(req, oneCase.request);
      if ('authenticated' in oneCase) {
        req.isAuthenticated = function() { return oneCase.authenticated; };
      }
      var res = new MockResponse();
      var nextCalled = false;
      mw(req, res, function(err) { assert.ifError(err); nextCalled = true; });
      assert.strictEqual(nextCalled, oneCase.redirect === undefined);
      assert.strictEqual(res._redirect, oneCase.redirect);
      if ('returnTo' in oneCase) {
        assert.strictEqual(req.session.returnTo, oneCase.returnTo);
      }
    };
  };
}

module.exports = {
  MockRequest: MockRequest,
  MockResponse: MockResponse,
  getTestMiddleware: getTestMiddleware
};
