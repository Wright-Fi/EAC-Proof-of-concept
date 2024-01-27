// configs.js

// Define your Application Configurations here
var config = {

  // Meraki API Key
  apiKey: "Enter-API-Key-Here",

  // Meraki API Base URL
  apiUrl: "https://api.meraki.com/api/v1", // Updated Meraki API from V0 to V1

  // The Meraki Network ID
  networkId: "Enter-Network-ID-Here",

  // Enter your password and corresponding Group Policy ID here
  policyMappings: {
    "Password1": "101",
    "Password2": "102",
    "Password3": "103"
  }
};

module.exports = config;
