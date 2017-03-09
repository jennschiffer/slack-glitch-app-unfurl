//
// Adapted from https://github.com/johnagan/tinyspeck
// This does much of the heavy-lifting for our bot. It does things like sending data to Slack's API,
// parsing the Slack messages received, implementing the event handler as well as setting up a Web Server
// to listen for WebHooks and set up the routes to serve pages for OAuth and the Add to Slack button.
//
"use strict";

const dispatcher = require('httpdispatcher'),
      http = require('http'),
      axios = require('axios'),
      WebSocket = require('ws'),
      qs = require('querystring'),
      EventEmitter = require('events'),
      oauthd = require('./oauthd.js'),
      add_to_slack = 'https://slack.com/oauth/authorize?scope=links:read,links:write,&client_id=' + process.env.SLACK_CLIENT_ID;
    

class TinySpeck extends EventEmitter {
  /**
   * Contructor
   *
   * @param {Object} defaults - The default config for the instance
   */
  constructor(defaults) {
    super();
    this.cache = {};

    // message defaults
    this.defaults = defaults || {};
    
    // loggers
    this.on('error', console.error);
  }


  /**
   * Create an instance of the TinySpeck adapter
   *
   * @param {Object} defaults - The default config for the instance
   * @return {TinySpeck} A new instance of the TinySpeck adapter
   */
  instance(defaults) {
    return new this.constructor(defaults);
  }


  /**
   * Send data to Slack's API
   *
   * @param {string} endPoint - The method name or url (optional - defaults to chat.postMessage)
   * @param {object} args - The JSON payload to send
   * @return {Promise} A promise with the API result
   */
  send(/* ...args */) {
    let args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
    
    let endPoint = 'chat.postMessage'; // default action is post message
    
    // if an endpoint was passed in, use it
    if (typeof args[0] === 'string') endPoint = args.shift();

    // use defaults when available
    let message = Object.assign({}, this.defaults, args);
    
    // call update if ts included
    if (message.ts && endPoint === 'chat.postMessage') endPoint = 'chat.update';
    
    return this.post(endPoint, message);
  }


  /**
   * Parse a Slack message
   *
   * @param {object|string} message - The incoming Slack message
   * @return {Message} The parsed message
   */
  parse(message) {
    if (typeof message === 'string') {
      try { message = JSON.parse(message); }      // JSON string
      catch(e) { message = qs.parse(message); }   // QueryString
    }
    
    // message button payloads are JSON strings
    if (message.payload) message.payload = JSON.parse(message.payload);
    
    return message;
  }


  /**
   * Digest a Slack message and process events
   *
   * @param {object|string} message - The incoming Slack message
   * @return {Message} The parsed message
   */
  digest(message) {
    let event_ts = this.parse(message).event_ts;
    let event = this.parse(message).event;
    let command = this.parse(message).command;
    let type = this.parse(message).type;
    let trigger_word = this.parse(message).trigger_word;
    let payload = this.parse(message).payload;
    
    // wildcard
    this.emit('*', message);

    // notify incoming message by type
    if (type) this.emit(type, message);

    // notify slash command by command
    if (command) this.emit(command, message);

    // notify event triggered by event type
    if (event) this.emit(event.type, message);

    // notify webhook triggered by trigger word
    if (trigger_word) this.emit(trigger_word, message);

    // notify message button triggered by callback_id
    if (payload) this.emit(payload.callback_id, message);

    return message;
  }


  /**
   * Event handler for incoming messages
   *
   * @param {mixed} names - Any number of event names to listen to. The last will be the callback
   * @return {TinySpeck} The TinySpeck adapter
   */
  on(/* ...names */) {
    let names = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
    let callback = names.pop(); // support multiple events per callback
    names.forEach(name => super.on(name, callback));

    return this; // chaining support
  }


  /**
   * Start RTM
   *
   * @param {object} options - Optional arguments to pass to the rtm.start method
   * @return {WebSocket} A promise containing the WebSocket
   */
  rtm(options) {
    return this.send('rtm.start', options).then(res => {
      this.cache = res.data.self;
      let ws = new WebSocket(res.data.url);
      ws.on('message', this.digest.bind(this));
      ws.on('close', () => this.ws = null);
      ws.on('open', () => this.ws = ws);
      return Promise.resolve(ws);
    });
  }


 /**
   * WebServer to listen for WebHooks
   *
   * @param {int} port - The port number to listen on
   * @param {string} token - Optionally provide a token to verify
   * @return {listener} The HTTP listener
   */
  listen(port, token) {
    // handle oauth from Slack
    dispatcher.onGet("/auth/grant", function(req, res) {
      if(req.params.code){
        res.writeHead(200, {'Content-Type': 'text/html'});
        let html = '<p>Success! Authed ok</p>';
        res.end(html);
      } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        let html = '<p>Failed! Something went wrong when authing, check the logs</p>';
        res.end(html);    
      }
      
      // get the code, turn it into a token    
      let code = req.params.code;
      oauthd.oauth(code)
        .then()
        .catch(function(error) {
          console.log(error);
          res.send(error);
        });
    });       
    
    // Display the Add to Slack button
    dispatcher.onGet("/", function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      let html = `<div class="add-to-slack">
            <h1>Glitch\'s Slack App Unfurling App</h1>
            <h2>A link unfurling app using Slack's Events API and new chat unfurl endpoint</h2>
            
            <p>This project will respond to any message linking to Glitch project <br />
            links with a set of actionable links for a richer Glitch experience!</p>

            <a id="add-to-slack" href="${add_to_slack}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
          </div>

          <div class="slack-support">
            <p>For directions on how to set up your own unfurling app, <a href="/SETUP.md">read SETUP.md</a>.</p>
            <p>For further help <a href="https://support.gomix.me">ask in the Glitch support forum</a>!</p>
          </div>

          <footer id="gWidget"></footer>
          <script src="https://widget.gomix.me/widget.min.js"></script>`;
      res.end(html);
    });
    
    return http.createServer((req, res) => {
      let data = '';
      
      req.on('data', chunk => data += chunk);
      
      req.on('end', () => {
        let message = this.parse(data);

        // notify upon request
        this.emit(req.url, message); 

        // new subscription challenge
        if (message.challenge){ console.log("verifying event subscription!"); res.end(message.challenge); return exit(); }
        
        // digest the incoming message
        if (!token || token === message.token) this.digest(message);
        
        // close response
        res.end();
      });

      dispatcher.dispatch(req, res);

    }).listen(port, '0.0.0.0', () => {
      console.log(`listening for events on port ${port}`);
    });
  }


  /**
   * POST data to Slack's API
   *
   * @param {string} endPoint - The method name or url
   * @param {object} payload - The JSON payload to send
   * @return {Promise} A promise with the api result
   */
  post(endPoint, payload) {
    payload = payload[0];
    
    // setting the token to be what is in the .env file
    // this can be retrieved in the OAUTH & Permissions section
    // of the api.slack.apps page where you created
    let token = process.env.SLACK_OAUTH_ACCESS_TOKEN;
    
    if (!/^http/i.test(endPoint)) {
      // serialize JSON params
      if (payload.attachments)
        payload.attachments = JSON.stringify(payload.attachments);
      // serialize JSON for POST
      payload = qs.stringify(payload);
    } else {
      if(isJSON(payload.attachments)){
        payload.attachments = JSON.parse(payload.attachments);
      }
    }
    
    if(endPoint.indexOf('hooks')!=-1){
      return axios({ // responding to slash command
        url: endPoint,
        data: payload,
        method: 'post', 
        headers: { 'user-agent': 'TinySpeck' }
      });
    } else {
      return axios({ // responding to event
        url: endPoint+"?token="+token,
        data: payload,
        method: 'post',
        baseURL: 'https://slack.com/api/', 
        headers: { 'user-agent': 'TinySpeck' }
      });
    }
  }
}

function isJSON(data) {
  var ret = true;
  try {
    JSON.parse(data);
  }catch(e) {
    ret = false;
  }
  return ret;
}

module.exports = new TinySpeck();