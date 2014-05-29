var common = require("./common"),
    test = require("tap").test;

var express = require("express");

// We can use a fake audience in tests
var audience = "http://example.org:80";

test("basic login test with defaults", function(t) {
  t.plan(6);

  common.createServer({audience: audience}, function(err, server) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var host = "http://localhost:8383";
      var localVerifier = host + "/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData, res) {
        t.equal(res.statusCode, 200);
        t.equal(verifiedData.status, "okay");
        t.equal(verifiedData.email, assertionData.email);
        common.getSessionData(host + "/session", function(err, body) {
          t.equal(body.email, assertionData.email);
          common.logout(host + "/persona/logout", function(err, body) {
            t.equal(body.status, "okay");
            common.getSessionData(host + "/session", function(err, body) {
              t.equal(body.email, null);
              t.end();
              server.close();
            });
          });
        });
      });
    });
  });
});

test("no audience set", function(t) {
  t.plan(3);

  common.createServer({}, function(err, server) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var localVerifier = "http://localhost:8383/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData, res) {
        t.equal(res.statusCode, 500);
        t.equal(verifiedData.status, "failure");
        t.equal(verifiedData.reason, "need assertion and audience");
        t.end();
        server.close();
      });
    });
  });
});

test("wrong audience", function(t) {
  t.plan(3);

  common.createServer({audience: audience}, function(err, server) {
    common.getAssertionFor("http://lolhaxzors.net:80", function(err, assertionData) {
      var localVerifier = "http://localhost:8383/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData, res) {
        t.equal(res.statusCode, 500);
        t.equal(verifiedData.status, "failure");
        t.equal(verifiedData.reason, "audience mismatch: domain mismatch");
        t.end();
        server.close();
      });
    });
  });
});

test("no default options", function(t) {
  t.plan(6);

  common.createServer({
    audience: audience,
    verifyPath: "/browserid/verify",
    logoutPath: "/browserid/logout",
    sessionKey: "user",
    verifyResponse: function (error, req, res, email) { res.json({ error: error, email: email }); },
    logoutResponse: function (error, req, res) { res.json({error: error}); }
  }, function(err, server) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var host = "http://localhost:8383";
      var localVerifier = host + "/browserid/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData, res) {
        t.equal(res.statusCode, 200);
        t.equal(verifiedData.error, null);
        t.equal(verifiedData.email, assertionData.email);
        common.getSessionData(host + "/session", function(err, body) {
          t.equal(body.user, assertionData.email);
          common.logout(host + "/browserid/logout", function(err, body) {
            t.equal(body.error, null);
            common.getSessionData(host + "/session", function(err, body) {
              t.equal(body.user, null);
              t.end();
              server.close();
            });
          });
        });
      });
    });
  });
});

test("bad SSL cert on the verifier", function(t) {
  t.plan(3);

  common.createServer({
    audience: audience,
    verifierURI: "https://63.245.217.134/verify"
  }, function(err, server) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var localVerifier = "http://localhost:8383/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData, res) {
        t.equal(res.statusCode, 500);
        t.equal(verifiedData.status, "failure");
        t.equal(verifiedData.reason, "Hostname/IP doesn't match certificate's altnames");
        t.end();
        server.close();
      });
    });
  });
});
