"use strict";

var assert = require('assert');
var login = require('../lib/index.js');


describe('connect-ensure-login', function() {

  describe('module', function() {
    it('should export ensureLoggedIn', function() {
      assert.strictEqual(typeof login.ensureLoggedIn, 'function');
      assert.strictEqual(login.ensureLoggedIn, login.ensureAuthenticated);
    });

    it('should export ensureLoggedOut', function() {
      assert.strictEqual(typeof login.ensureLoggedOut, 'function');
      assert.strictEqual(login.ensureLoggedOut, login.ensureNotLoggedIn);
      assert.strictEqual(login.ensureLoggedOut, login.ensureUnauthenticated);
      assert.strictEqual(login.ensureLoggedOut, login.ensureNotAuthenticated);
    });

    it('should export isLocalPath', function() {
      assert.strictEqual(typeof login.isLocalPath, 'function');
      assert.strictEqual(login.isLocalPath('/foo/bar?x=1'), true);
      assert.strictEqual(login.isLocalPath('//evil.com/x'), false);
      assert.strictEqual(login.isLocalPath(undefined), false);
    });
  });

});
