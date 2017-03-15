## What You'll Need
*  A [Slack account](https://slack.com/)

## Step 1: Setting up your Slack App
To get started [remix this project](https://gomix.com/#!/remix/solid-tugboat) to get your own project with a copy of the code. Then on Slack's site, select '[Create New App](https://api.slack.com/apps)' and fill in the details about your Slack bot. You can edit them later, so put in what you can for now and save. 

## Step 2: Setting up your Redirect URLs
Navigate to the 'OAuth & Permissions' page and under 'Redirect URLs' add your  project URL followed by '/auth/grant' - use your publish URL (click 'Show') which has the format 'https://project-name.gomix.me'. So for our example app, the URL is: 'https://slack-bot.gomix.me/auth/grant'. Click "Save URLs."

## Step 3: Copy Across the Slack Tokens
Now go to the 'Basic Information page' and go to the 'App Credentials' section. You want to copy these details into your project's `.env` file. This is a file that securely stores your app credentials. There are entries for `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`. Copy and paste the entries from the App Credentials page for Client ID and Client Secret against the variable names. 

## Step 4: Enable the Events API and Verify Your URL endpoint
Go to the 'Event Subscriptions' page. Here you need to enable event subscriptions for your app by toggling the button to 'on'. Then you want to verify your project URL to use those events. Copy and paste your project's published URL into the 'Request URL' box (again it will have the format 'https://project-name.gomix.me'). You should get a verified message, indicating it successfully reached your project.

Now you want to tell Slack which events you'll actually be using for your bot, so it only sends you those ones. In our App Unfurling App, we want to listen for URL shared events. So for 'Team Events', add 'link_shared' events. Add domains that you want to unfurl underneath that - this app looks specifically for Glitch app domain names, so you'll need to update the logic in `index.js` if you want to use your own! Click 'Save Changes' to finish.

## Step 5: Select Permission Scopes and install to team for OAuth token
Navigate back to the 'Oauth & Permissions' page. There should be a `links:read` scope under 'Permission Scopes' but you'll also need to add `links:write` so we can have Slack message back the unfurled responses. Click "Save Changes."

## Testing Your App
Go to your app landing page (you can click "Show" at the top of Glitch to find it, and this project's landing page is [solid-tugboat.glitch.me](https://solid-tugboat.glitch.me). 

Your app should now be up and running and able to respond to actions you make in Slack. If you type messages with the domain you set up in the app it should unfurl!


## Getting Help
You can see other example projects on our [Community Projects](https://gomix.com/community/) page. And if you get stuck, let us know on the [forum](http://support.gomix.com/) and we can help you out.