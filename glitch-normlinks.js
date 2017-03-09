//
// Not all glitch links are projects, so we want to control how those
// links are unfurled but in their own way. In this document, we
// list those "norm links" and define the unfurl objects to be sent,
// keeping our `index.js` logic a little cleaner.
//

// some style defaults
const thumb_url = 'https://gomix.com/slack-icon.png';
const color = '#ff00ff';

// here are some custom unfurl objects and a list of "norm links" or non-project pages
// which we still want to unfurl but not with the standard buttons
const mainUnfurl = {
  title: '<http://glitch.com|Glitch>',
  text: 'Combining automated deployment, instant hosting & collaborative editing, Glitch gets you straight to coding so you can build full-stack web apps, fast.',
  fallback: 'glitch.com',
  thumb_url,
  color,
};

const supportUnfurl = {
  title: '<http://support.glitch.com|Glitch Support>',
  text: 'A helpful place for those new to Glitch.',
  fallback: 'support.glitch.com',
  thumb_url,
  color,
};

const statusUnfurl = {
  title: '<http://status.glitch.com|Glitch Status>',
  text: 'Welcome to Glitch\'s home for real-time and historical data on system performance.',
  fallback: 'status.glitch.com',
  thumb_url,
  color,
};

const communityUnfurl = {
  title: '<http://glitch.com/community|Glitch Community>',
  text: 'Explore Glitch - remix and create the app or bot of your dreams!',
  fallback: 'glitch.com/community',
  thumb_url,
  color,
};

const aboutUnfurl = {
  title: '<http://glitch.com/about|About Glitch>',
  text: 'Explor Glitch - remix and create the app or bot of your dreams!',
  fallback: 'glitch.com/about',
  thumb_url,
  color,
};

const legalUnfurl = {
  title: '<http://glitch.com/legal|Glitch - Legal Stuff>',
  text: 'Legal stuff, like our TOS and Privacy Policy',
  fallback: 'glitch.com/legal',
  thumb_url,
  color,
};

const helpUnfurl = {
  title: '<http://glitch.com/help/faqs/|Get Help with Glitch>',
  text: 'Learn more about Glitch, starting with some stuff we\'re asked a lot.',
  fallback: 'glitch.com/help/faqs',
  thumb_url,
  color,
};

const normLinks = {
  'https://gomix.com': mainUnfurl,
  'https://gomix.com/': mainUnfurl,
  'http://gomix.com': mainUnfurl,
  'http://gomix.com/': mainUnfurl,
  'https://gomix.me': mainUnfurl,
  'https://gomix.me/': mainUnfurl,
  'http://gomix.me': mainUnfurl,
  'http://gomix.me/': mainUnfurl,
  'https://glitch.com': mainUnfurl,
  'https://glitch.com/': mainUnfurl,
  'http://glitch.com': mainUnfurl,
  'http://glitch.com/': mainUnfurl,
  'https://glitch.me': mainUnfurl,
  'https://glitch.me/': mainUnfurl,
  'http://glitch.me': mainUnfurl,
  'http://glitch.me/': mainUnfurl,
  'https://support.gomix.com': supportUnfurl,
  'https://support.gomix.com/': supportUnfurl,
  'http://support.gomix.com': supportUnfurl,
  'http://support.gomix.com/': supportUnfurl,
  'https://support.glitch.com': supportUnfurl,
  'https://support.glitch.com/': supportUnfurl,
  'http://support.glitch.com': supportUnfurl,
  'http://support.glitch.com/': supportUnfurl,
  'https://status.gomix.com': statusUnfurl,
  'https://status.gomix.com/': statusUnfurl,
  'http://status.gomix.com': statusUnfurl,
  'http://status.gomix.com/': statusUnfurl,
  'https://status.glitch.com': statusUnfurl,
  'https://status.glitch.com/': statusUnfurl,
  'http://status.glitch.com': statusUnfurl,
  'http://status.glitch.com/': statusUnfurl,
  'https://gomix.com/community': communityUnfurl,
  'https://gomix.com/community/': communityUnfurl,
  'http://gomix.com/community': communityUnfurl,
  'http://gomix.com/community/': communityUnfurl,
  'https://glitch.com/community': communityUnfurl,
  'https://glitch.com/community/': communityUnfurl,
  'http://glitch.com/community': communityUnfurl,
  'http://glitch.com/community/': communityUnfurl,
  'https://gomix.com/about': aboutUnfurl,
  'https://gomix.com/about/': aboutUnfurl,
  'http://gomix.com/about': aboutUnfurl,
  'http://gomix.com/about/': aboutUnfurl,
  'https://glitch.com/about': aboutUnfurl,
  'https://glitch.com/about/': aboutUnfurl,
  'http://glitch.com/about': aboutUnfurl,
  'http://glitch.com/about/': aboutUnfurl,
  'https://gomix.com/legal': legalUnfurl,
  'https://gomix.com/legal/': legalUnfurl,
  'http://gomix.com/legal': legalUnfurl,
  'http://gomix.com/legal/': legalUnfurl,
  'https://glitch.com/legal': legalUnfurl,
  'https://glitch.com/legal/': legalUnfurl,
  'http://glitch.com/legal': legalUnfurl,
  'http://glitch.com/legal/': legalUnfurl,
  'https://gomix.com/help/faqs': helpUnfurl,
  'https://gomix.com/help/faqs/': helpUnfurl,
  'http://gomix.com/help/faqs': helpUnfurl,
  'http://gomix.com/help/faqs/': helpUnfurl,
  'https://glitch.com/help/faqs': helpUnfurl,
  'https://glitch.com/help/faqs/': helpUnfurl,
  'http://glitch.com/help/faqs': helpUnfurl,
  'http://glitch.com/help/faqs/': helpUnfurl,
};

module.exports = normLinks;