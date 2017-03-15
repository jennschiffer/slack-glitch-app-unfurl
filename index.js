//
// This implements most of the app code and implements code that sets up 
// event handling for when the 'link_shared' event is activated.
//

'use strict';

const ts = require('./tinyspeck.js');
const axios = require('axios');
const datastore = require('./datastore.js').data;
const glitchEndpoint = 'https://api.glitch.com/projects/';

// some link and style defaults
const thumb_url = 'https://gomix.com/slack-icon.png';
const color = '#ff00ff';

let connected = false;
getConnected() // Check we have a database connection
  .then(function(){
    // slack.defaults.token
    let slack = ts.instance({});

    // listen for a url to be shared in a message
    slack.on('link_shared', payload => {  
      datastore.get(payload.team_id) // Grab the team's token
        .then(function(value){
          let unfurlBot = slack.instance({ token: value })            

          // we are going to collect unfurl objects to send, project names to prevent duplicates,
          // and promises to make sure we don't send messages to slack before glitch api calls 
          // are responded to
          const unfurls = {};
          const projectNames = [];
          const projectsPromises = [];

          // for each even url in the payload, we're going to add an object
          // used by slack to message back the unfurled link to the `unfurls` object
          payload.event.links.forEach((link, i) => {

            let projectLink = false;
            let projectName = '';

            if ( link.domain === 'gomix.me' || link.domain === 'glitch.me' ) {
              // .me implies it's the project "show" page
              const hostname = link.url.split('//')[1];
              projectName = hostname.split('.')[0];
              projectLink = true;

            } else if ( (link.domain === 'gomix.com' || link.domain === 'glitch.com') && link.url.indexOf('#!/project') > -1 ) {
                // .com plus a hashbang implies it's the project editor
                const hostnameArray = link.url.split('/');
                projectName = hostnameArray[hostnameArray.length-1];
                projectLink = true;

              } 

            // now that we should have the project name, generate the attachment if
            // an attachment for this given project hasn't been generated yet
            if ( projectLink && !projectNames.includes(projectName) ) {
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
                  const title = `${projectName} // ${response.data.description}`;

                  const glitchDescription = `Glitch lets you add to, modify and change real projects built by our community. Run the code to see the app in action, view the source code, or remix to start making this app your own!`;
                  const showLink = `<https://${projectName}.gomix.me|:runner: Run Code>`;
                  const viewCode = `<https://gomix.com/#!/project/${projectName}|:flags: View Code>`;
                  const remixLink = `<https://gomix.com/#!/remix/${projectName}|:microphone: Remix On Glitch>`;
                  const text = `${glitchDescription} \n\n${showLink}    ${viewCode}    ${remixLink}`;

                  const fallback = link.url.substr(link.url.indexOf(':') + 1);

                  unfurls[link.url] = {
                    title,
                    text,
                    fallback,
                    thumb_url,
                    color,
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
            if ( Object.getOwnPropertyNames(unfurls).length !== 0 ) {
              // here we create the final message object to send to slack, which includes
              // the unfurls object we created above and the channel and ts properties 
              // we retrieved from the payload, if there are any unfurls to send
              const unfurlMessage = {
                channel: payload.event.channel,
                ts: payload.event.message_ts,
                unfurls: JSON.stringify(unfurls),
              }

              // finally, we send slack the unfurlMessage by calling the chat.unfurl endpoint
              // with unfurlMessage as the argument. 
              unfurlBot.send('chat.unfurl', unfurlMessage).then(res => { 
                console.log('Response sent to unfurl', res.data);
              }, reason => { 
                // on failure
                console.log('An error occurred when responding to unfurl: ' + reason);
              }); 
            }
          }));
        });
     });
    // incoming http requests
    slack.listen('3000');

});

function getConnected() {
  return new Promise(function (resolving) {
    if(!connected){
      connected = datastore.connect().then(function(){
        resolving();
      });
    } else {
      resolving();
    }
  });
}