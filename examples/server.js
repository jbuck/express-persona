var express = require("express");

var app = express.createServer();

app.use(express.logger())
   .use(express.static(__dirname))
   .use(express.bodyParser())
   .use(express.cookieParser())
   .use(express.session({
     secret: "mozillapersona"
   }));

require("../../index.js")(app, {
  audience: "http://localhost:3000"
});

app.listen(3000, function() {
  var addy = app.address();
  console.log('HTTP server started on http://localhost:3000');
  console.log('Press Ctrl+C to stop');
});
