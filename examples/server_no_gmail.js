var express = require("express"),
    app = express();

// The bodyParser, cookieParser, and session middlewares are required for express-persona
// If you don"t want to use express" session middle, you could also use `client-sessions`
app.use(express.logger())
   .use(express.static(__dirname))
   .use(express.urlencoded())
   .use(express.json())
   .use(express.cookieParser())
   .use(express.session({
     secret: "mozillapersona"
   }));

// This is how you include express-persona in your app
// In your own app you should use `require("express-persona")`
// You *must* specify the audience option
require("../index.js")(app, {
  audience: "http://localhost:3000",
  verifyResponse: function(err, req, res, email) {
    if (email.indexOf("gmail") === -1) {
      req.session.authorized = true;
      res.json({ status: "okay", email: email });
      return;
    }

    res.json({ status: "failure", reason: "Gmail users are not permitted to use this website" });
  },
  logoutResponse: function(err, req, res) {
    if (req.session.authorized) {
      req.session.authorized = null;
    }

    res.json({ status: "okay" });
  }
});

app.listen(3000, function() {
  console.log("HTTP server started on http://localhost:3000");
  console.log("Press Ctrl+C to stop");
});
