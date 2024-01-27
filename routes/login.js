var express = require('express');
var router = express.Router();
var request = require("request");
var axios = require("axios");
var configs = require("./../configs");

// Validation middleware to ensure password is valid, if not the form is rerendered.
function validatePassword(req, res, next) {
  const password = req.body.password;
  const policyId = configs.policyMappings[password];

  if (policyId) {
    next(); // Proceed to login logic
  } else {
    console.log("Incorrect Password")
    res.render('index', req.body);
    }
}

// POST login data
router.post('/', validatePassword, (req, res) => {
  const clientMac = req.body.client_mac;
  const baseUrl = req.protocol + '://' + req.get('host');
  const apiEndpoint = '/api/networks/' + configs.networkId + '/clients/' + clientMac + '/policy?timespan=84000';
  const policyId = configs.policyMappings[req.body.password]; // Retrieve policyId from middleware

  // Bind client to a group policy id
  axios.put(baseUrl + apiEndpoint, {
    devicePolicy: 'Group policy',
    groupPolicyId: policyId
  })
  .then(response => {
    console.log("Policy Applied: ", response.data);
    // Process Meraki Login
    res.writeHead(302, {
      'Location': req.body.base_grant_url + "?continue_url=" + req.body.user_continue_url
    });
    res.end();
    //res.render('index', payload);
  })
  .catch(error => {
    console.log("Policy Failed", error);
    res.end();
  });
});

module.exports = router;
