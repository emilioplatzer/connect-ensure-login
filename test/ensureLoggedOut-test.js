var assert = require('assert');
var ensureLoggedOut = require('../lib/ensureLoggedOut.js');


function MockRequest() {
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


describe('ensureLoggedOut', function() {

  describe('middleware with a url', function() {
    var mw = ensureLoggedOut('/home');

    it('when authenticated: redirects', function() {
      var req = new MockRequest();
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/home');
    });

    it('when not authenticated: calls next, does not redirect', function() {
      var req = new MockRequest();
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      var nextCalled = false;
      mw(req, res, function(err) { assert.ifError(err); nextCalled = true; });
      assert(nextCalled);
      assert.strictEqual(res._redirect, undefined);
    });

    it('when it lacks an isAuthenticated function: calls next, does not redirect', function() {
      var req = new MockRequest();
      var res = new MockResponse();
      var nextCalled = false;
      mw(req, res, function(err) { assert.ifError(err); nextCalled = true; });
      assert(nextCalled);
      assert.strictEqual(res._redirect, undefined);
    });
  });

  describe('middleware with a url and baseUrl', function() {
    var mw = ensureLoggedOut({redirectTo:'/home', baseUrl:'/app'});

    it('when authenticated: redirects relatively', function() {
      var req = new MockRequest();
      req.originalUrl = '/app/login';
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'home');
    });

    it('when authenticated on a sub-app: redirects relatively', function() {
      var req = new MockRequest();
      req.originalUrl = '/sub/foo';
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '../app/home');
    });

    it('when authenticated and only req.url is set: redirects relatively', function() {
      var req = new MockRequest();
      req.url = '/app/login';
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'home');
    });

    it('when not authenticated: calls next, does not redirect', function() {
      var req = new MockRequest();
      req.originalUrl = '/app/login';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      var nextCalled = false;
      mw(req, res, function(err) { assert.ifError(err); nextCalled = true; });
      assert(nextCalled);
      assert.strictEqual(res._redirect, undefined);
    });
  });

  describe('middleware with defaults', function() {
    var mw = ensureLoggedOut();

    it('when authenticated: redirects to /', function() {
      var req = new MockRequest();
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/');
    });
  });

});
