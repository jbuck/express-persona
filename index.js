"use strict";

var https = require("https"),
    qs = require("querystring"),
    url = require("url");

module.exports = function(app, options) {
  options = options || {};

  var audience = options.audience;

  // Use our own https agent that rejects bad SSL certs
  var verifierOpts = url.parse("https://verifier.login.persona.org/verify");
  verifierOpts.method = "POST";
  verifierOpts.rejectUnauthorized = true;
  verifierOpts.agent = new https.Agent(verifierOpts);

  app.post("/browserid/verify", function(req, res) {
    var vreq = https.request(verifierOpts, function(verifierRes) {
      var body = "";

      // How to differentiate between a network error and an SSL error?
      verifierRes.on("error", function(error) {
        console.error(arguments);
        res.json({
          status: "failure",
          reason: "Server-side exception"
        });
      });

      verifierRes.on("data", function(chunk) {
        body = body + chunk;
      });

      // Match the Persona Remote Verification API's return values
      // https://developer.mozilla.org/en-US/docs/Persona/Remote_Verification_API#Return_values
      verifierRes.on("end", function() {
        try {
          var response = JSON.parse(body),
              valid = response && response.status === "okay";

          if (valid) {
            if (req.session) {
              req.session.email = response.email;
            }

            res.json({
              status: "okay",
              email: response.email
            });
          } else {
            res.json({
              status: "failure",
              reason: response.reason
            });
          }

        } catch (e) {
          res.json({
            status: "failure",
            reason: "Server-side exception"
          });
        }
      });
    });
    vreq.setHeader("Content-Type", "application/x-www-form-urlencoded");
    var data = qs.stringify({
      assertion: req.body.assertion,
      audience: audience
    });
    vreq.setHeader("Content-Length", data.length);
    vreq.write(data);
    vreq.end();
  });

  app.post("/browserid/logout", function(req, res) {
    if (req.session) {
      req.session.email = null;
    }

    res.json(true);
  });
};
