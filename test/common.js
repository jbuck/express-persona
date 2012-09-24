var async = require("async"),
    express = require("express"),
    http = require("http"),
    url = require("url");

var email, password, q;

http.get("http://personatestuser.org/email", function(res) {
  var data = "";

  res.on("data", function(chunk) {
    data = data + chunk;
  });

  res.on("end", function() {
    var obj = JSON.parse(data);
    email = obj.email;
    password = obj.pass;
    q.concurrency = 1;
    q.process();
  });
});

// wait until we have an email and password before processing this queue
q = async.queue(function(task, callback) {
  var url = "http://personatestuser.org/assertion/" +
    encodeURIComponent(task.audience)+ "/" +
    encodeURIComponent(email) + "/" +
    encodeURIComponent(password);

  http.get(url, function(res) {
    var data = "";

    res.on("data", function(chunk) {
      data = data + chunk;
    });

    res.on("end", function() {
      var obj = JSON.parse(data);
      callback(null, obj);
    });
  });
}, 0);

module.exports = {
  getAssertionFor: function getAssertionFor(audience, callback) {
    q.push({audience: audience}, callback);
  },
  createServer: function createServer(options, callback) {
    var app = express.createServer();

    app.use(express.bodyParser())
      .use(express.cookieParser())
      .use(express.session({
        secret: "blah"
      }));

    app.listen(0, "127.0.0.1", function() {
      require('../index.js')(app, options);
      callback(null, app);
    });
  },
  verifyAssertion: function verifyAssertion(localVerifier, assertion, callback) {
    var requestOpts = url.parse(localVerifier);
    requestOpts.method = "POST";

    var request = http.request(requestOpts, function(verifyRes) {
      var data = "";

      verifyRes.on("data", function(chunk) {
        data = data + chunk;
      });

      verifyRes.on("end", function() {
        var obj = JSON.parse(data);
        callback(null, obj);
      });
    });
    request.setHeader("Content-Type", "application/json");
    var data = JSON.stringify({
      assertion: assertion
    });
    request.setHeader("Content-Length", data.length);
    request.end(data);
  }
};
