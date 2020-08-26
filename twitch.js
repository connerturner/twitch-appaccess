const twitchClientId = "";
const twitchClientSecret = "";
const twitchRedirectUri = "https://localhost:8080";

//token info
var currentToken = ""; //store current token
var currentRefreshToken = ""; //store refresh object associated with token

const axios = require('axios'); //node http req library
const crypto = require('crypto');

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

// should create instance of express on localhost then open OAuth initial URL and wait for response
function initCallback(){
    //call webService and wait for response
}

function webService(){}
// Scope is an array of twitch OAuth scopes e.g ['user:edit','user:read:broadcast']
// 
function getUserAccessToken(clientId, clientSecret, scope){
    //check if userAccessToken is valid, then stop
    //else initCallback
    
    //build oauth code request
    var oauthAuthorizeURI = "?client_id="+clientId+"&redirect_uri="+twitchRedirectUri+"&response_type=code&scope="+scope.join('+')
    //get CSRF state/string
    var csrfString = "&state="+crypto.randomBytes(64).toString('hex');

    //DEBUG
    console.log("Sending followin Authorize URI: \n","https://id.twitch.tv/oauth2/authorize"+oauthAuthorizeURI+csrfString);
}

//getAppAccessToken(twitchClientId, twitchClientSecret);
getUserAccessToken(twitchClientId, twitchClientSecret, ['user:edit', 'user:read:email', 'user:edit:follows'])

