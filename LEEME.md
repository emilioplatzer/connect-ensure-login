<!--multilang v0 es:LEEME.md en:README.md -->
# ensure-login
<!--lang:es-->

Middleware para Connect/Express que asegura que haya una sesión iniciada.

<!--lang:en--]

Login session ensuring middleware for Connect/Express.

[!--lang:*-->

<!-- cucardas -->
[![npm-version](https://img.shields.io/npm/v/ensure-login.svg)](https://npmjs.org/package/ensure-login)
[![downloads](https://img.shields.io/npm/dm/ensure-login.svg)](https://npmjs.org/package/ensure-login)
[![build](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/build-and-test.yml)
[![security](https://socket.dev/api/badge/npm/package/ensure-login)](https://socket.dev/npm/package/ensure-login)
[![qa-control](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/qa-control.yml/badge.svg)](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/qa-control.yml)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->

Basado en [connect-ensure-login de jaredhanson](https://github.com/jaredhanson/connect-ensure-login), con estos agregados:

   * Parámetro `baseUrl` que permite redirecciones detrás de Nginx y Apache.
   * `setReturnTo` admite una expresión regular: la URL se recuerda sólo si la matchea.
   * No recuerda la URL cuando la llamada fue AJAX (salvo que `setReturnWhenXhr` sea `true`) y sólo recuerda peticiones GET.

<!--lang:en--]

Based on [jaredhanson's connect-ensure-login](https://github.com/jaredhanson/connect-ensure-login), with these additions:

   * `baseUrl` parameter that allows redirects behind Nginx and Apache.
   * `setReturnTo` accepts a regular expression: the URL is remembered only if it matches.
   * It does not remember the URL when the call was made through AJAX (unless `setReturnWhenXhr` is `true`) and it only remembers GET requests.

[!--lang:es-->

Este middleware asegura que el usuario tenga la sesión iniciada. Si llega una
petición no autenticada, se la redirige a una página de login. La URL se guarda
en la sesión, de modo que se pueda devolver al usuario a la página que había
pedido originalmente.

## Instalación

<!--lang:en--]

This middleware ensures that a user is logged in. If a request is received that
is unauthenticated, the request will be redirected to a login page. The URL
will be saved in the session, so the user can be conveniently returned to the
page that was originally requested.

## Install

[!--lang:*-->

```sh
$ npm install ensure-login
```

<!--lang:es-->

## Uso

### Asegurar la autenticación

En este ejemplo una aplicación tiene una página de preferencias que requiere
que el usuario tenga la sesión iniciada.

<!--lang:en--]

## Usage

### Ensure Authentication

In this example, an application has a settings page where preferences can be
configured. A user must be logged in before accessing this page.

[!--lang:*-->

```js
app.get('/settings',
  ensureLoggedIn({baseUrl:'/', redirectTo:'/login', setReturnTo:/^([^/]*|.*\/)[^.]+$/}),
  function(req, res) {
    res.render('settings', { user: req.user });
  });
```

<!--lang:es-->

Si el usuario no tiene la sesión iniciada al intentar acceder a esta página, se
lo redirige a `/login` y la URL original (`/settings`) se guarda en la sesión en
`req.session.returnTo`.

### Iniciar sesión y volver

Este middleware se integra con [Passport](http://passportjs.org/). Basta con
montar el middleware `authenticate()` de Passport en la ruta de login.

<!--lang:en--]

If a user is not logged in when attempting to access this page, the request will
be redirected to `/login` and the original request URL (`/settings`) will be
saved to the session at `req.session.returnTo`.

### Log In and Return To

This middleware integrates seamlessly with [Passport](http://passportjs.org/).
Simply mount Passport's `authenticate()` middleware at the login route.

[!--lang:*-->

```js
app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login',
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
  })
);
```

<!--lang:es-->

Al iniciar sesión, Passport detecta la URL `returnTo` guardada en la sesión y
redirige al usuario de vuelta a `/settings`.

### Paso a paso

Si el usuario no tiene la sesión iniciada, la secuencia de peticiones y
respuestas puede ser confusa. Este es el detalle de lo que ocurre:

1. El usuario navega a `GET /settings`
    - El middleware guarda `session.returnTo` con `/settings`
    - El middleware redirige a `/login`
2. El navegador sigue la redirección a `GET /login`
    - La aplicación muestra el formulario de login (u ofrece SSO)
3. El usuario envía sus credenciales con `POST /login`
    - La aplicación verifica las credenciales
    - Passport lee `session.returnTo` y redirige a `/settings`
4. El navegador sigue la redirección a `GET /settings`
    - Ya autenticado, la aplicación muestra la página de preferencias

<!--lang:en--]

Upon log in, Passport will notice the `returnTo` URL saved in the session and
redirect the user back to `/settings`.

### Step By Step

If the user is not logged in, the sequence of requests and responses that take
place during this process can be confusing. Here is a step-by-step overview of
what happens:

1. User navigates to `GET /settings`
    - Middleware sets `session.returnTo` to `/settings`
    - Middleware redirects to `/login`
2. User's browser follows redirect to `GET /login`
    - Application renders a login form (or, alternatively, offers SSO)
3. User submits credentials to `POST /login`
    - Application verifies credentials
    - Passport reads `session.returnTo` and redirects to `/settings`
4. User's browser follows redirect to `GET /settings`
    - Now authenticated, application renders settings page

[!--lang:*-->

## API

### ensureLoggedIn(opts)

<!--lang:es-->

opción           |predeterminado |tipo               |significado
-----------------|---------------|-------------------|------------------------------------------
`redirectTo`     |`'/login'`     |string             |URL a la que redirigir para el login
`setReturnTo`    |`true`         |boolean o RegExp   |guarda la URL en la sesión, siempre o cuando matchea la RegExp
`baseUrl`        |`'/'`          |string             |URL base donde está montado `redirectTo`
`setReturnWhenXhr`|`false`       |boolean            |incluye las llamadas AJAX al recordar la URL de retorno

<!--lang:en--]

option           |default        |type               |meaning
-----------------|---------------|-------------------|------------------------------------------
`redirectTo`     |`'/login'`     |string             |URL to redirect to for login
`setReturnTo`    |`true`         |boolean or RegExp  |set the URL in the session, always or when it matches the RegExp
`baseUrl`        |`'/'`          |string             |URL of the base where `redirectTo` is mounted
`setReturnWhenXhr`|`false`       |boolean            |include AJAX calls when remembering the return URL

[!--lang:*-->

<!--lang:es-->

## Pruebas

<!--lang:en--]

## Tests

[!--lang:*-->

```sh
$ npm install
$ npm test
```

<!--lang:es-->

## Créditos

  - [Jared Hanson](http://github.com/jaredhanson) por la versión original
  - [Emilio Platzer](http://github.com/emilioplatzer) por los agregados

## Licencia

<!--lang:en--]

## Credits

  - [Jared Hanson](http://github.com/jaredhanson) for the original
  - [Emilio Platzer](http://github.com/emilioplatzer) for the additions

## License

[!--lang:*-->

[MIT](LICENSE)
