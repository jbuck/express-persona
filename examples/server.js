var express = require("express"),
    app = express();

// The bodyParser, cookieParser, and session middlewares are required for express-persona
// If you don't want to use express' session middle, you could also use `client-sessions`
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
  audience: "http://localhost:3000"
});

app.listen(3000, function() {
  console.log('HTTP server started on http://localhost:3000');
  console.log('Press Ctrl+C to stop');
});
