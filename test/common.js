var async = require("async"),
    express = require("express"),
    request = require("request");

var email, password, q;

request.get({
  uri: "http://personatestuser.org/email",
  json: true
}, function(error, response, body) {
  email = body.email;
  password = body.pass;
  q.concurrency = 1;
  q.process();
});

// wait until we have an email and password before processing this queue
q = async.queue(function(task, callback) {
  var uri = "http://personatestuser.org/assertion/" +
    encodeURIComponent(task.audience)+ "/" +
    encodeURIComponent(email) + "/" +
    encodeURIComponent(password);

  request.get({
    uri: uri,
    json: true
  }, function(error, response, body) {
    callback(null, body);
  });
}, 0);

module.exports = {
  getAssertionFor: function getAssertionFor(audience, callback) {
    q.push({audience: audience}, callback);
  },
  createServer: function createServer(options, callback) {
    var app = express();

    app.use(express.json())
      .use(express.cookieParser())
      .use(express.session({
        secret: "blah"
      }));

    app.get("/session", function(req, res) {
      res.json(req.session);
    });

    require('../index.js')(app, options);

    var server = app.listen(8383, "127.0.0.1", function() {
      callback(null, server);
    });
  },
  verifyAssertion: function verifyAssertion(localVerifier, assertion, callback) {
    request.post({
      uri: localVerifier,
      json: {
        assertion: assertion
      },
      jar: true
    }, function(err, response, body) {
      callback(err, body);
    });
  },
  getSessionData: function getSessionData(uri, callback) {
    request.get({
      uri: uri,
      json: true,
      jar: true
    }, function(err, response, body) {
      callback(err, body);
    });
  },
  logout: function logout(localLogout, callback) {
    request.post({
      uri: localLogout,
      json: true,
      jar: true
    }, function(err, response, body) {
      callback(err, body);
    });
  }
};
