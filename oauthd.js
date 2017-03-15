//
// This is a library file that handles the OAuth flow with Slack.
//

'use strict'

var rq = require('request');

// https://api.slack.com/methods/oauth.access
function oauth(code, uri) {
  return post({
    url: 'https://slack.com/api/oauth.access',
    transform: JSON.parse,
    form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: code
    }
  });
}

// teensy conversion to Promise-based API
function post(options) {
  return new Promise(function(resolve, reject) {
    rq.post(options, function(error, response, body) {
        if (error) {
          console.log('http error');
          reject(error);
        }
        if (options.transform) {
          body = options.transform(body);
        }
        if (body.ok) {
          console.log('success');
          resolve(body);
        } else {
          console.log('API error');
          reject(body.error || body);
        }
      });
  });
} 

module.exports = {
  oauth: oauth
};
