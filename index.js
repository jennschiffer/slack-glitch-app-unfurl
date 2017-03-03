//
// This implements most of the bot code. It starts off by looking for the `bot_token` value that will
// have been stored if you successfully OAuthed with your Bot using the 'Add to Slack' button. Assuming
// it exists, it implements an instance of `slack`, and then listens out for incoming HTTP requests.
// It also implements code that sets up event handling for when the 'url_shared' event is activated.
//

"use strict";

const slack = require('./tinyspeck.js');

// listen for a url to be shared in a message
slack.on('url_shared', payload => {  
  console.log("Received: " + payload.event.type + " from user " + payload.event.user, payload);
  
  // we're going to collect an array of objects of "unfurls" to send back
  const unfurls = {};

  // for each even url in the payload, we're going to push to the unfurls array
  // an object used by slack to message back the unfurled link
  payload.event.urls.forEach((url, i) => {
    let validLink = false;
    let projectName = '';
    
    // check if the domain is glitch.com, glitch.me, gomix.com, or gomix.me
    if ( url.indexOf('gomix.me') > -1 || url.indexOf('glitch.me') > -1 ) {
      // gomix.me or glitch.me implies it's the project "show" page
      const hostname = url.split('//')[1];
      projectName = hostname.split('.')[0];
      validLink = true;
      
    } else if ( url.indexOf('gomix.com') > -1 || url.indexOf('glitch.com') > -1 ) {
        // gomix.com or glitch.com implies it's the project editor
        const hostnameArray = url.split('/');
        projectName = hostnameArray[hostnameArray.length-1];
        validLink = true;
      
      } else {
          // we shouldn't be searching for other links hmmmmmm
          validLink = false;
        }
    
    // now that we should have the project name, generate the attachment
    if ( validLink ) {
      const title = 'This is a Glitch project!';
      const text = `The name of the project is ~~*${projectName}*~~, check it out!`;
      const fallback = url.substr(url.indexOf(':') + 1);

      unfurls[url] = {
          title,
          text,
          fallback,
          color: '#ff00ff',
      };
    }
  });
    
  // here we create the final message object to send to slack, which includes
  // the unfurls array we created above and the channel and ts properties 
  // we retrieve from the payload
  const unfurlMessage = {
    channel: payload.event.channel,
    ts: payload.event.message_ts,
    unfurls: JSON.stringify(unfurls)
  }
  
      
  // finally, we send slack the unfurlMessage by calling the chat.unfurl endpoint
  // with unfurlMessage as the argument. hope it works!
  slack.send('chat.unfurl', unfurlMessage).then(res => { 
    console.log("Response sent to unfurl", res.data);
  }, reason => { 
    // on failure
    console.log("An error occurred when responding to unfurl: " + reason);
  }); 
}); 

slack.listen('3000');
