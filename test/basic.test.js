var common = require("./common"),
    test = require("tap").test;

// We can use a fake audience in tests
var audience = "http://example.org:80";

test("basic login test with defaults", function(t) {
  t.plan(2);

  common.createServer({audience: audience}, function(err, app) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var localVerifier = "http://localhost:" + app.address().port + "/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData) {
        t.equal(verifiedData.status, "okay");
        t.equal(verifiedData.email, assertionData.email);
        t.end();
        app.close();
      });
    });
  });
});

test("no audience set", function(t) {
  t.plan(2);

  common.createServer({}, function(err, app) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var localVerifier = "http://localhost:" + app.address().port + "/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData) {
        t.equal(verifiedData.status, "failure");
        t.equal(verifiedData.reason, "need assertion and audience");
        t.end();
        app.close();
      });
    });
  });
});
