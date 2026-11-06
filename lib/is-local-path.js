"use strict";

/**
 * Whether `path` is a path of this same site, so redirecting to it cannot take the browser to another host.
 *
 * @param {*} path
 * @return {boolean}
 * @api public
 */
module.exports = function isLocalPath(path){
  // Debe empezar con "/" pero no ser protocol-relative ("//host" o "/\host"),
  // que el navegador interpreta como un host externo (open redirect).
  // Tampoco puede tener tabuladores ni saltos de línea: el navegador los elimina ("/\t/host" se convierte en "//host").
  return typeof path === 'string' && /^\/(?![/\\])[^\t\n\r]*$/.test(path);
}
