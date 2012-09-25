"use strict";

var https = require("https"),
    url = require("url");

var defaultOptions = {
  audience: "",
  logoutPath: "/persona/logout",
  sessionKey: "email",
  verifierURI: "https://verifier.login.persona.org/verify",
  verifyPath: "/persona/verify"
};

module.exports = function(app, options) {
  options = options || {};

  var personaOpts = {};
  Object.keys(defaultOptions).forEach(function(key) {
    if (typeof options[key] === "string") {
      personaOpts[key] = options[key];
    } else {
      personaOpts[key] = defaultOptions[key];
    }
  });

  // Use our own https agent that rejects bad SSL certs
  var verifierOpts = url.parse(personaOpts.verifierURI);
  verifierOpts.method = "POST";
  verifierOpts.rejectUnauthorized = true;
  verifierOpts.agent = new https.Agent(verifierOpts);

  app.post(personaOpts.verifyPath, function(req, res) {
    var vreq = https.request(verifierOpts, function(verifierRes) {
      var body = "";

      verifierRes.on("error", function(error) {
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
              req.session[personaOpts.sessionKey] = response.email;
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
    // SSL validation can fail, which will be thrown here
    vreq.on("error", function(error) {
      res.json({
        status: "failure",
        reason: "Server-side exception"
      });
    });
    vreq.setHeader("Content-Type", "application/json");
    var data = JSON.stringify({
      assertion: req.body.assertion,
      audience: personaOpts.audience
    });
    vreq.setHeader("Content-Length", data.length);
    vreq.end(data);
  });

  app.post(personaOpts.logoutPath, function(req, res) {
    if (req.session) {
      req.session[personaOpts.sessionKey] = null;
    }

    res.json({
      status: "okay"
    });
  });
};
