### Get App Access token for Twitch Helix.

Uses `CLIENT_ID` and `CLIENT_SECRET` environment variables for the Twitch OAuth Client ID and Twitch Client Secret respectively

Assumes the redirect will be hosted at localhost:8080, this can be changed in the server.listen method
  
```
cd twitch-appaccess && npm install
export CLIENT_ID=abc CLIENT_SECRET=123; node twitch.js
```

