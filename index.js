//
// This implements most of the app code and implements code that sets up 
// event handling for when the 'url_shared' event is activated.
//

"use strict";

const slack = require('./tinyspeck.js');
const axios = require('axios');
const glitchEndpoint = 'https://api.gomix.com/projects/';

// listen for a url to be shared in a message
slack.on('url_shared', payload => {  
  
  // we're going to collect an array of objects of "unfurls" to send back
  const unfurls = {};
  
  // we want to keep track of projectNames so we don't post duplicate unfurls
  const projectNames = [];
  
  // we need to track promises to make sure we get all projects information
  // from the glitch endpoints hit before sending to slack
  const projectsPromises = [];

  // for each even url in the payload, we're going to add an object
  // used by slack to message back the unfurled link to the `unfurls` object
  payload.event.urls.forEach((url, i) => {
    let validLink = false;
    let projectName = '';
    
    // these are a list of subdomains we use which should not be seen as valid project names
    const invalidProjectNames = ['', 'gomix', 'glitch', 'status', 'support'];

    // check if the domain is glitch.com, glitch.me, gomix.com, or gomix.me
    if ( url.indexOf('gomix.me') > -1 || url.indexOf('glitch.me') > -1 ) {
      
      // .me implies it's the project "show" page
      const hostname = url.split('//')[1];
      projectName = hostname.split('.')[0];
      validLink = true;
      
    } else if ( (url.indexOf('gomix.com') > -1 || url.indexOf('glitch.com') > -1) && url.indexOf('#!') > -1 ) {
        
      // .com plus a hashbang implies it's the project editor
        const hostnameArray = url.split('/');
        projectName = hostnameArray[hostnameArray.length-1];
        validLink = true;
      
      } else {
          // for some reason this link is in our list but not gomix/glitch.com/me
          validLink = false;
        }
    
    // now that we should have the project name, generate the attachment if
    // an attachment for this given project hasn't been generated yet
    if ( validLink && !invalidProjectNames.includes(projectName) && !projectNames.includes(projectName) ) {
      
      // push project name to array so we prevent duplicates
      projectNames.push(projectName);

      // hit the glitch endpoint to get this project's information
      // note: this is specific to glitch, use your own api and update the logic
      // or if you don't need to call another api, feel free to remove. you will 
      // also then probably want to remove the promises array pushing along with
      // any reference to axios in this file only
      projectsPromises.push(axios.get(glitchEndpoint + projectName)
        .then(function (response) {
          
          // generate the items of the unfurl message and add that object to `unfurls`
          const title = projectName;
        
          const showLink = `<https://${projectName}.gomix.me|:runner: Run Code>`;
          const viewCode = `<https://gomix.com/#!/project/${projectName}|:flags: View Code>`;
          const remixLink = `<https://gomix.com/#!/remix/${projectName}|:microphone: Remix On Glitch>`;
          const text = `${response.data.description} \n\n ${showLink}    ${viewCode}    ${remixLink}`;

          const thumb_url = 'https://gomix.com/slack-icon.png';
          const fallback = url.substr(url.indexOf(':') + 1);

          unfurls[url] = {
            title,
            text,
            fallback,
            thumb_url,
            color: '#ff00ff',
          };
        })
        .catch(function (error) {
          console.log(error);
        })
      );
    } 
  });
  
  // once all the promises have been completed, generate and send to slack the unfurls
  axios.all(projectsPromises)
  .then(axios.spread(function(acct, perms) {
    
    // here we create the final message object to send to slack, which includes
    // the unfurls object we created above and the channel and ts properties 
    // we retrieved from the payload
    const unfurlMessage = {
      channel: payload.event.channel,
      ts: payload.event.message_ts,
      unfurls: JSON.stringify(unfurls)
    }

    // finally, we send slack the unfurlMessage by calling the chat.unfurl endpoint
    // with unfurlMessage as the argument. 
    slack.send('chat.unfurl', unfurlMessage).then(res => { 
      console.log("Response sent to unfurl", res.data);
    }, reason => { 
      // on failure
      console.log("An error occurred when responding to unfurl: " + reason);
    }); 
  }));
}); 

slack.listen('3000');
