# ensure-login

Login session ensuring middleware for Connect/Express.


[![npm-version](https://img.shields.io/npm/v/ensure-login.svg)](https://npmjs.org/package/ensure-login)
[![downloads](https://img.shields.io/npm/dm/ensure-login.svg)](https://npmjs.org/package/ensure-login)
[![build](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/build-and-test.yml)
[![sonar](https://sonarcloud.io/api/project_badges/measure?project=emilioplatzer_connect-ensure-login&metric=alert_status)](https://sonarcloud.io/summary/overall?id=emilioplatzer_connect-ensure-login)
[![qa-control](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/qa-control.yml/badge.svg)](https://github.com/emilioplatzer/connect-ensure-login/actions/workflows/qa-control.yml)


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


Based on [jaredhanson's connect-ensure-login](https://github.com/jaredhanson/connect-ensure-login), with these additions:

   * `baseUrl` parameter that allows redirects behind Nginx and Apache.
   * `setReturnTo` accepts a regular expression: the URL is remembered only if it matches.
   * It does not remember the URL when the call was made through AJAX (unless `setReturnWhenXhr` is `true`) and it only remembers GET requests.


This middleware ensures that a user is logged in. If a request is received that
is unauthenticated, the request will be redirected to a login page. The URL
will be saved in the session, so the user can be conveniently returned to the
page that was originally requested.

## Install


```sh
$ npm install ensure-login
```


## Usage

### Ensure Authentication

In this example, an application has a settings page where preferences can be
configured. A user must be logged in before accessing this page.


```js
app.get('/settings',
  ensureLoggedIn({baseUrl:'/', redirectTo:'/login', setReturnTo:/^([^/]*|.*\/)[^.]+$/}),
  function(req, res) {
    res.render('settings', { user: req.user });
  });
```


If a user is not logged in when attempting to access this page, the request will
be redirected to `/login` and the original request URL (`/settings`) will be
saved to the session at `req.session.returnTo`.

### Log In and Return To

This middleware integrates seamlessly with [Passport](http://passportjs.org/).
Simply mount Passport's `authenticate()` middleware at the login route.


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


## API

### ensureLoggedIn(opts)


option           |default        |type               |meaning
-----------------|---------------|-------------------|------------------------------------------
`redirectTo`     |`'/login'`     |string             |URL to redirect to for login
`setReturnTo`    |`true`         |boolean or RegExp  |set the URL in the session, always or when it matches the RegExp
`baseUrl`        |`'/'`          |string             |URL of the base where `redirectTo` is mounted
`setReturnWhenXhr`|`false`       |boolean            |include AJAX calls when remembering the return URL



## Tests


```sh
$ npm install
$ npm test
```


## Credits

  - [Jared Hanson](http://github.com/jaredhanson) for the original
  - [Emilio Platzer](http://github.com/emilioplatzer) for the additions

## License


[MIT](LICENSE)
