var async = require("async"),
    http = require("http"),
    test = require("tap").test,
    url = require("url");

async.waterfall([

  function(callback) {
    var express = require("express"),
        app = express.createServer();

    app.use(express.bodyParser())
      .use(express.cookieParser())
      .use(express.session({
        secret: "blah"
      }));

    app.listen(0, "127.0.0.1", function() {
      var audience = "http://localhost:" + app.address().port;

      require('../index.js')(app, {
        audience: audience
      });

      callback(null, audience);
    });
  },

  function(audience, callback) {
    http.get("http://personatestuser.org/email_with_assertion/" + encodeURIComponent(audience), function(res) {
      var data = "";

      res.on("data", function(chunk) {
        data = data + chunk;
      });

      res.on("end", function() {
        data = JSON.parse(data);
        callback(null, audience, data.assertion, data.email);
      });
    });
  }

], function(err, audience, assertion, email) {
  async.series([
    function(callback) {
      test("basic browserid test", function(t) {
        var requestOpts = url.parse(audience + "/browserid/verify");
        requestOpts.method = "POST";

        var request = http.request(requestOpts, function(verifyRes) {
          var data = "";

          verifyRes.on("data", function(chunk) {
            data = data + chunk;
          });

          verifyRes.on("end", function() {
            data = JSON.parse(data);
            t.equal(data.status, "okay", "status should be 'okay'");
            t.equal(data.email, email, "email returned should be same as sent");
            t.end();
            callback();
          });
        });
        request.setHeader("Content-Type", "application/json");
        var data = JSON.stringify({
          assertion: assertion
        });
        request.setHeader("Content-Length", data.length);
        request.end(data);
      });
    }
  ], function(err) {
    process.nextTick(function() {
      process.exit();
    });
  });
});
