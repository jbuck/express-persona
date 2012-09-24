var common = require("./common"),
    test = require("tap").test;

// We can use a fake audience in tests
var audience = "http://example.org:80";

// Create the express server, and pass the options object to express-persona
test("basic login test with defaults", function(t) {
  t.plan(2);

  common.createServer({audience: audience}, function(err, app) {
    common.getAssertionFor(audience, function(err, assertionData) {
      var localVerifier = "http://localhost:" + app.address().port + "/persona/verify";

      common.verifyAssertion(localVerifier, assertionData.assertion, function(err, verifiedData) {
        t.equal(verifiedData.status, "okay", "status should be 'okay'");
        t.equal(verifiedData.email, assertionData.email, "email returned should be same as sent");
        t.end();
        app.close();
      });
    });
  });
});
