"use strict";

var ensureLoggedOut = require('../lib/ensureLoggedOut.js');
var getTestMiddleware = require('./support/middleware-cases.js').getTestMiddleware;


describe('ensureLoggedOut', function() {

  describe('middleware with a url', function() {
    var testEnsureLoggedOut = getTestMiddleware(ensureLoggedOut('/home'));

    it('when authenticated: redirects', testEnsureLoggedOut({
      request: {}, authenticated: true, redirect: '/home'}));
    it('when not authenticated: calls next, does not redirect', testEnsureLoggedOut({
      request: {}, authenticated: false}));
    it('when it lacks an isAuthenticated function: calls next, does not redirect', testEnsureLoggedOut({
      request: {}}));
  });

  describe('middleware with a url and baseUrl', function() {
    var testEnsureLoggedOut = getTestMiddleware(ensureLoggedOut({redirectTo:'/home', baseUrl:'/app'}));

    it('when authenticated: redirects relatively', testEnsureLoggedOut({
      request: {originalUrl: '/app/login'}, authenticated: true, redirect: 'home'}));
    it('when authenticated on a sub-app: redirects relatively', testEnsureLoggedOut({
      request: {originalUrl: '/sub/foo'}, authenticated: true, redirect: '../app/home'}));
    it('when authenticated and only req.url is set: redirects relatively', testEnsureLoggedOut({
      request: {url: '/app/login'}, authenticated: true, redirect: 'home'}));
    it('when authenticated and the query has slashes: redirects relatively from the path, not from the query', testEnsureLoggedOut({
      request: {originalUrl: '/app/login?next=/a/b/c'}, authenticated: true, redirect: 'home'}));
    it('when not authenticated: calls next, does not redirect', testEnsureLoggedOut({
      request: {originalUrl: '/app/login'}, authenticated: false}));
  });

  describe('middleware with defaults', function() {
    var testEnsureLoggedOut = getTestMiddleware(ensureLoggedOut());

    it('when authenticated: redirects to /', testEnsureLoggedOut({
      request: {}, authenticated: true, redirect: '/'}));
  });

});
