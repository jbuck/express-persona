express-persona
===============

Mozilla Persona integration for Express. express-persona is designed to quickly get
Persona authentication working in your Express application, while following Persona
security best practices.

Quick Start
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

Add the Persona login to a web page, and send the assertion to your Express application:

```javascript
loginButton.addEventListener("click", function() {
  navigator.id.get(function(assertion) {
    if (!assertion) {
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/browserid/verify", true);
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
Coming soon

Tests
-----
Run tests using `npm test`.
