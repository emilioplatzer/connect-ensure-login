var assert = require('assert');
var ensureLoggedIn = require('../lib/ensureLoggedIn.js');


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


describe('ensureLoggedIn', function() {

  describe('middleware with a url', function() {
    var mw = ensureLoggedIn('/signin');

    it('when authenticated: calls next, does not redirect nor set returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo';
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      var nextCalled = false;
      mw(req, res, function(err) { assert.ifError(err); nextCalled = true; });
      assert(nextCalled);
      assert.strictEqual(res._redirect, undefined);
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('when not authenticated: redirects and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, '/foo');
    });

    it('when not authenticated on a sub-app: sets returnTo to originalUrl', function() {
      var req = new MockRequest();
      req.url = '/foo';
      req.originalUrl = '/sub/foo';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, '/sub/foo');
    });

    it('when it lacks an isAuthenticated function: redirects and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo';
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, '/foo');
    });
  });

  describe('middleware with a url and baseUrl', function() {
    var mw = ensureLoggedIn({redirectTo:'/signin', baseUrl:'/app', setReturnTo:/^([^/]*|.*\/)[^.]+$/});

    it('when authenticated: calls next, does not redirect nor set returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo';
      req.isAuthenticated = function() { return true; };
      var res = new MockResponse();
      var nextCalled = false;
      mw(req, res, function(err) { assert.ifError(err); nextCalled = true; });
      assert(nextCalled);
      assert.strictEqual(res._redirect, undefined);
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('when not authenticated: redirects relatively and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'signin');
      assert.strictEqual(req.session.returnTo, '/app/foo');
    });

    it('when requesting a resource (matches no setReturnTo): redirects but does not set returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo.png';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'signin');
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('when an AJAX request: redirects but does not set returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo';
      req.xhr = true;
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'signin');
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('when not authenticated on a sub-app: redirects relatively and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo';
      req.originalUrl = '/sub/foo';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '../app/signin');
      assert.strictEqual(req.session.returnTo, '/sub/foo');
    });

    it('when it lacks an isAuthenticated function: redirects and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo';
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'signin');
      assert.strictEqual(req.session.returnTo, '/app/foo');
    });
  });

  describe('middleware with a baseUrl that remembers AJAX', function() {
    var mw = ensureLoggedIn({redirectTo:'/signin', baseUrl:'/app', setReturnWhenXhr:true});

    it('when an AJAX request that is not authenticated: redirects and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo';
      req.xhr = true;
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'signin');
      assert.strictEqual(req.session.returnTo, '/app/foo');
    });

    it('when a POST request that is not authenticated: redirects but does not set returnTo', function() {
      var req = new MockRequest();
      req.url = '/app/foo';
      req.method = 'POST';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, 'signin');
      assert.strictEqual(req.session.returnTo, undefined);
    });
  });

  describe('middleware with a redirectTo and setReturnTo:false', function() {
    var mw = ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false });

    it('when not authenticated: redirects but does not set returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/session/new');
      assert.strictEqual(req.session.returnTo, undefined);
    });
  });

  describe('middleware with defaults', function() {
    var mw = ensureLoggedIn();

    it('when not authenticated: redirects to /login and sets returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/login');
      assert.strictEqual(req.session.returnTo, '/foo');
    });
  });

  describe('middleware with a non-local returnTo (open redirect)', function() {
    var mw = ensureLoggedIn('/signin');

    it('does not save a protocol-relative path (//host) as returnTo', function() {
      var req = new MockRequest();
      req.url = '//evil.com/x';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('does not save a backslash protocol-relative path (/\\host) as returnTo', function() {
      var req = new MockRequest();
      req.url = '/\\evil.com/x';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('does not save a path that does not start with a slash', function() {
      var req = new MockRequest();
      req.url = 'evil.com/x';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, undefined);
    });

    it('still saves a normal local path as returnTo', function() {
      var req = new MockRequest();
      req.url = '/foo/bar';
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      mw(req, res, function() { throw new Error('should not be called'); });
      assert.strictEqual(res._redirect, '/signin');
      assert.strictEqual(req.session.returnTo, '/foo/bar');
    });
  });

  describe('middleware when there is no session', function() {
    var mw = ensureLoggedIn('/signin');

    it('when not authenticated: warns, redirects and does not crash', function() {
      var req = new MockRequest();
      req.url = '/foo';
      delete req.session;
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      var warned = 0;
      var originalWarn = console.warn;
      console.warn = function() { warned++; };
      try {
        mw(req, res, function() { throw new Error('should not be called'); });
      } finally {
        console.warn = originalWarn;
      }
      assert.strictEqual(warned, 1);
      assert.strictEqual(res._redirect, '/signin');
    });
  });

  describe('middleware when session.save fails', function() {
    var mw = ensureLoggedIn('/signin');

    it('when not authenticated: calls next with the error and does not redirect', function() {
      var saveError = new Error('save failed');
      var req = new MockRequest();
      req.url = '/foo';
      req.session.save = function(cb) { cb(saveError); };
      req.isAuthenticated = function() { return false; };
      var res = new MockResponse();
      var nextErr;
      mw(req, res, function(err) { nextErr = err; });
      assert.strictEqual(nextErr, saveError);
      assert.strictEqual(res._redirect, undefined);
    });
  });

});
