"use strict";

var Path = require('path');

/**
 * URL, relative to the current request, that reaches `url` mounted at `baseUrl`.
 * The query string is not part of the path: it is excluded before taking the directory of the request.
 *
 * @param {Object} req
 * @param {string} baseUrl
 * @param {string} url
 * @return {string}
 * @api private
 */
module.exports = function relativeRedirectUrl(req, baseUrl, url) {
  var currentPath = (req.originalUrl || req.url).split('?')[0];
  var targetUrl = Path.posix.join(baseUrl, url);
  return Path.posix.relative(Path.posix.dirname(currentPath), targetUrl);
}
