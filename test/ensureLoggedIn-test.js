"use strict";

var assert = require('assert');
var ensureLoggedIn = require('../lib/ensureLoggedIn.js');
var support = require('./support/middleware-cases.js');
var MockRequest = support.MockRequest;
var MockResponse = support.MockResponse;
var getTestMiddleware = support.getTestMiddleware;


describe('ensureLoggedIn', function() {

  describe('middleware with a url', function() {
    var testEnsureLoggedIn = getTestMiddleware(ensureLoggedIn('/signin'));

    it('when authenticated: calls next, does not redirect nor set returnTo', testEnsureLoggedIn({
      request: {url: '/foo'}, authenticated: true, returnTo: undefined}));
    it('when not authenticated: redirects and sets returnTo', testEnsureLoggedIn({
      request: {url: '/foo'}, authenticated: false, redirect: '/signin', returnTo: '/foo'}));
    it('when not authenticated on a sub-app: sets returnTo to originalUrl', testEnsureLoggedIn({
      request: {url: '/foo', originalUrl: '/sub/foo'}, authenticated: false, redirect: '/signin', returnTo: '/sub/foo'}));
    it('when it lacks an isAuthenticated function: redirects and sets returnTo', testEnsureLoggedIn({
      request: {url: '/foo'}, redirect: '/signin', returnTo: '/foo'}));
  });

  describe('middleware with a url and baseUrl', function() {
    // the same expression that login-plus uses (Regexplicit.detectNonEmptyUrlWithoutResources)
    var testEnsureLoggedIn = getTestMiddleware(ensureLoggedIn({redirectTo:'/signin', baseUrl:'/app', setReturnTo:/^([^?#]*\/)?[^./?#]+([?#].*)?$/}));

    it('when authenticated: calls next, does not redirect nor set returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo'}, authenticated: true, returnTo: undefined}));
    it('when not authenticated: redirects relatively and sets returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo'}, authenticated: false, redirect: 'signin', returnTo: '/app/foo'}));
    it('when requesting a resource (matches no setReturnTo): redirects but does not set returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo.png'}, authenticated: false, redirect: 'signin', returnTo: undefined}));
    it('when an AJAX request: redirects but does not set returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo', xhr: true}, authenticated: false, redirect: 'signin', returnTo: undefined}));
    it('when not authenticated on a sub-app: redirects relatively and sets returnTo', testEnsureLoggedIn({
      request: {url: '/foo', originalUrl: '/sub/foo'}, authenticated: false, redirect: '../app/signin', returnTo: '/sub/foo'}));
    it('when the query has slashes: redirects relatively from the path, not from the query', testEnsureLoggedIn({
      request: {url: '/app/foo?next=/a/b/c'}, authenticated: false, redirect: 'signin', returnTo: '/app/foo?next=/a/b/c'}));
    it('when the query has slashes on a sub-app: redirects relatively from the path, not from the query', testEnsureLoggedIn({
      request: {url: '/foo?q=/z', originalUrl: '/sub/foo?q=/z'}, authenticated: false, redirect: '../app/signin', returnTo: '/sub/foo?q=/z'}));
    it('when it lacks an isAuthenticated function: redirects and sets returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo'}, redirect: 'signin', returnTo: '/app/foo'}));
  });

  describe('middleware with a baseUrl that remembers AJAX', function() {
    var testEnsureLoggedIn = getTestMiddleware(ensureLoggedIn({redirectTo:'/signin', baseUrl:'/app', setReturnWhenXhr:true}));

    it('when an AJAX request that is not authenticated: redirects and sets returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo', xhr: true}, authenticated: false, redirect: 'signin', returnTo: '/app/foo'}));
    it('when a POST request that is not authenticated: redirects but does not set returnTo', testEnsureLoggedIn({
      request: {url: '/app/foo', method: 'POST'}, authenticated: false, redirect: 'signin', returnTo: undefined}));
  });

  describe('middleware with a redirectTo and setReturnTo:false', function() {
    var testEnsureLoggedIn = getTestMiddleware(ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false }));

    it('when not authenticated: redirects but does not set returnTo', testEnsureLoggedIn({
      request: {url: '/foo'}, authenticated: false, redirect: '/session/new', returnTo: undefined}));
  });

  describe('middleware with defaults', function() {
    var testEnsureLoggedIn = getTestMiddleware(ensureLoggedIn());

    it('when not authenticated: redirects to /login and sets returnTo', testEnsureLoggedIn({
      request: {url: '/foo'}, authenticated: false, redirect: '/login', returnTo: '/foo'}));
  });

  describe('middleware with a non-local returnTo (open redirect)', function() {
    var testEnsureLoggedIn = getTestMiddleware(ensureLoggedIn('/signin'));
    function notAuthenticatedRequest(url, returnTo) {
      return testEnsureLoggedIn({request: {url: url}, authenticated: false, redirect: '/signin', returnTo: returnTo});
    }

    it('does not save a protocol-relative path (//host) as returnTo', notAuthenticatedRequest('//evil.com/x', undefined));
    it('does not save a backslash protocol-relative path (/\\host) as returnTo', notAuthenticatedRequest('/\\evil.com/x', undefined));
    it('does not save a path that does not start with a slash', notAuthenticatedRequest('evil.com/x', undefined));
    it('still saves a normal local path as returnTo', notAuthenticatedRequest('/foo/bar', '/foo/bar'));
    it('does not save an absolute URL (http://host) as returnTo', notAuthenticatedRequest('http://evil.com/x', undefined)); // eslint-disable-line sonarjs/no-clear-text-protocols -- the absolute URL is the attack being tested
    it('does not save a protocol-relative path with several slashes (///host) as returnTo', notAuthenticatedRequest('///evil.com/x', undefined));
    it('does not save a mixed slash and backslash path (/\\/host) as returnTo', notAuthenticatedRequest('/\\/evil.com/x', undefined));
    it('saves a percent-encoded slash (/%2F) as a local path: the browser does not decode it', notAuthenticatedRequest('/%2F/evil.com/x', '/%2F/evil.com/x'));
    it('does not save a path with a tab: the browser removes it and /\\t/host becomes //host', notAuthenticatedRequest('/\t/evil.com/x', undefined));
    it('does not save a path with a line feed: the browser removes it', notAuthenticatedRequest('/\n/evil.com/x', undefined));
    it('does not save a path with a carriage return and line feed: the browser removes them', notAuthenticatedRequest('/\r\n/evil.com/x', undefined));
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
