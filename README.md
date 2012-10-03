express-persona [![Build Status](https://secure.travis-ci.org/jbuck/express-persona.png)](http://travis-ci.org/jbuck/express-persona)
===============

Mozilla Persona integration for Express. express-persona is designed to quickly get
Persona authentication working in your Express application, while following Persona
security best practices.

Quick start
-----------
Install using npm: `npm install express-persona`

Include the module inside your Express application:

```javascript
var express = require("express"),
    app = express.createServer();

app.use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
  	secret: "mozillapersona"
  }));

require("express-persona")(app, {
  audience: "http://localhost:8888" // Must match your browser's address bar
});
```

Add the [Persona login](https://developer.mozilla.org/en-US/docs/DOM/navigator.id#CallbackMethods) 
to a web page, and send the assertion to your Express application:

```javascript
loginButton.addEventListener("click", function() {
  navigator.id.get(function(assertion) {
    if (!assertion) {
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/persona/verify", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("loadend", function(e) {
      try {
        var data = JSON.parse(this.response);
        if (data.status === "okay") {
          // the email address the user logged in with
          console.log(data.email);
        } else {
          console.log("Login failed because " + data.reason);
        }
      } catch (ex) {
        // oh no, we didn't get valid JSON from the server
      }
    }, false);
    xhr.send(JSON.stringify({
      assertion: assertion
    }));
  });
}, false);
```

By default, express-persona adds the users email address to `req.session.email` when their
email is validated.

This library will handle 3 of 4 essential practices for [Persona security considerations]
(https://developer.mozilla.org/en-US/docs/Persona/Security_Considerations) but you should
implement CSRF protection as well. I recommend the built-in express csrf middleware.

Documentation
-------------

### API

* `require('express-persona')` returns `function(express, options)`
  * `express` is an instance of the express server that you want to add routes to
  * `options` is an object. It has one required parameter, `audience`.

### Required options

* `audience` - The URL of your express app when viewed in a browser. Must include the protocol, hostname, and port.
  * Example: `http://example.org:80`, `https://example.org:443`

### Optional options

* `verifyPath` - The URL that clients use to verify credentials.
  * Default: `/persona/verify`
  * Examples: `/browserid/verify`, `/api/verify`
* `logoutPath` - The URL that clients use to logout.
  * Default: `/persona/logout`
  * Examples: `/browserid/logout`, `/api/logout`
* `sessionKey` - The session key to store the validated email in.
  * Default: `email`
  * Example: `user`, `username`
* `verifierURI` - The URI of the Persona Remote Verification API
  * Default: `https://verifier.login.persona.org/verify`
  * You probably don't want to touch this unless you have a good reason, like testing.
* `verifyResponse(error, req, res, email)` - Function to generate response for verify route
  * Default: see _Verify route_, below, for successess and failure responses
  * `error` will be a string suitable for display (the "reason" attribute in the default implementation), if an error occurs
  * `req, res` are the request and response objects
  * `email` is a string containing the email, and will exist if there is not an error
* `logoutResponse(error, req, res)` - Function to generate response for logout route
  * Default: see _Logout route_, below, for response
  * `error` will be a string suitable for display, if an error occurs
  * `req, res` are the request and response objects

### Verify route

* On success:

```javascript
{
  "status": "okay"
  "email": "jon@example.org"
}
```

* On failure

```javascript
{
  "status": "failure"
  "reason": "request failed"
}
```

### Logout route

* Always returns:

```javascript
{
  "status": "okay"
}
```

Tests
-----

### Running Tests

Run tests using `npm test` from the root of the repository.
