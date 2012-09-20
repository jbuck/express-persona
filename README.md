express-persona
===============

Mozilla Persona integration for Express. express-persona is designed to quickly get
Persona authentication working in your Express application, while following Persona
security best practices.

Quick Start
-----------
Install using npm: `npm install express-persona`

Include the module inside your Express application:

```
var express = require("express"),
    app = express.createServer();

app.use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
  	secret: "mozillapersona"
  }));

require("express-persona")(app, {
  audience: "http://localhost:8888"
});
```

Add the Persona login to a web page, and send the assertion to your Express application:

```
loginButton.addEventListener("click", function() {
  navigator.id.get(function(assertion) {
    if (!assertion) {
      return;
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/browserid/verify", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.send(JSON.stringify({
      
    }));
  });
}, false);
```

Documentation
-------------
Coming soon

Tests
-----
Coming soon
