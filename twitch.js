const twitchClientId = "";
const twitchClientSecret = "";
const twitchRedirectUri = "http://localhost:8080";

//token info
var currentToken = ""; //store current token
var currentRefreshToken = ""; //store refresh object associated with token

const axios = require('axios'); //node http req library
const crypto = require('crypto'); //for hash functions and random
const http = require('http'); //for callback/redirectUri
const url = require('url'); //parse url becuase i'm to lazy to regex

// Use an instance of axios with defaults for clarity
const twitchHttp = axios.create({
    baseURL: 'https://id.twitch.tv'
});

// Sends POST to /oauth2/token endpoint to get appaccess token
// currently only on analytics:read:games scope
function getAppAccessToken(clientId, clientSecret){
    twitchHttp.post('/oauth2/token?client_id='+clientId+'&client_secret='+clientSecret+'&grant_type=client_credentials&scope=analytics:read:games')
    .then((response) => {
        console.log('{$response.statusCode}'); //print http status
        //check if response has access_token included, if so set it as the current token, else error and print full response
        (response.data.hasOwnProperty('access_token')) ? (console.log("got access token"), currentToken = response.data.access_token) : console.log("error getting access token full response: \n", response);
    }).catch((e) => {console.error(e)})
}

function refreshAppAccessToken(clientId, clientSecret, refreshToken){
    twitchHttp.post('/oauth2/token?grant_type=refresh_token&refresh_token='+refreshToken+'&client_id='+clientId+'&client_secret='+clientSecret)
    .then((response) =>{
        console.log('{$respone.statusCode}')
        console.log(response)    
    }).catch((e) => {console.error(e)})
}

/**
 * Create server instance listening on localhost/twitchRedirectUri
 * 
 * @param {string} twitchRedirectUri a fqdn with URI scheme that matches the one set in Twitch Dev Console
 * @returns http.IncomingMessage parsed query parameters
*/
function callbackService(redirectUri){
    try {
        //create server with anonymous function callback, 
        //will close after one request to it (hopefully the right one)
        var queryParams = "";
        var server = http.createServer((req, res) => {
            queryParams = url.parse(req.url, true).query
            res.end() 
            server.close()
        }).on('error', (e) => {throw err});
        server.listen({port:8080, host:"localhost"}, () => {console.log("Listening: "+server.address())});
    } catch (e) {
        console.log("Error Creating web service: \n",e);
    }
}

// Scope is an array of twitch OAuth scopes e.g ['user:edit','user:read:broadcast']
// 
function getUserAccessToken(clientId, clientSecret, scope){
    //check if userAccessToken is valid, then stop
    //else initCallback
    
    //build oauth code request
    var oauthAuthorizeURI = "?client_id="+clientId+"&redirect_uri="+twitchRedirectUri+"&response_type=code&scope="+scope.join('+')
    //get CSRF state/string
    var csrfString = "&state="+crypto.randomBytes(32).toString('hex');
    
    console.log("Authenticate in Browser: \n","https://id.twitch.tv/oauth2/authorize"+oauthAuthorizeURI+csrfString);

    callbackService(twitchRedirectUri)

    //
    //await for code in callback
    //
    //send to code to get access token
    //
    //post to follow endpoint with user access token
}

//getAppAccessToken(twitchClientId, twitchClientSecret);
getUserAccessToken(twitchClientId, twitchClientSecret, ['user:edit', 'user:read:email', 'user:edit:follows'])

