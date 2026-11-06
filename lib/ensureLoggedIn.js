"use strict";
/**
 * Ensure that a user is logged in before proceeding to next route middleware.
 *
 * This middleware ensures that a user is logged in.  If a request is received
 * that is unauthenticated, the request will be redirected to a login page (by
 * default to `/login`).
 *
 * Additionally, `returnTo` will be be set in the session to the URL of the
 * current request.  After authentication, this value can be used to redirect
 * the user to the page that was originally requested.
 *
 * Options:
 *   - `redirectTo`   URL to redirect to for login, defaults to _/login_
 *   - `setReturnTo`  set redirectTo in session, defaults to _true_
 *   - `baseUrl`      URL of the base where redirectTo is mounted, defaults to _/_
 *   - `setReturnWhenXhr` does not skips when AXAJ
 *
 * Examples:
 *
 *     app.get('/profile',
 *       ensureLoggedIn(),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn('/signin'),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false }),
 *       function(req, res) { ... });
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
var relativeRedirectUrl = require('./relative-redirect-url.js');
var isLocalPath = require('./is-local-path.js');

module.exports = function ensureLoggedIn(options) {
  if (typeof options === 'string') {
    options = { redirectTo: options }
  }
  options = options || {};

  var url = options.redirectTo || '/login';
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

  return function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      var savedReturnTo = false;
      // TODO: guardar returnTo solo en las navegaciones del usuario (encabezados Sec-Fetch-Mode: navigate y Sec-Fetch-Dest: document),
      // en lugar de depender de req.xhr (fetch no lo marca) y de un filtro por la forma de la URL en setReturnTo
      if (setReturnTo && req.method === 'GET' && (!req.xhr || options.setReturnWhenXhr)){
        var path = req.originalUrl || req.url;
        if (path && isLocalPath(path) && (setReturnTo===true || setReturnTo.test(path))) {
          if (req.session) {
            req.session.returnTo = path;
            savedReturnTo = true;
          } else {
            console.warn('ensure-login: no se puede guardar returnTo porque req.session no existe (¿está montado express-session?)');
          }
        }
      }
      var actualUrl = url;
      if('baseUrl' in options){
        actualUrl = relativeRedirectUrl(req, options.baseUrl, url);
      }
      if (savedReturnTo) {
        return req.session.save(function(err){
          if (err) { return next(err); }
          res.redirect(actualUrl);
        });
      }
      return res.redirect(actualUrl);
    }
    next();
  }
}
