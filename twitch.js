const twitchClientId = "";
const twitchClientSecret = "";

//token info
var currentToken = ""; //store current token
var currentRefreshToken = ""; //store refresh object associated with token

const axios = require('axios'); //node http req library

// Sends POST to /oauth2/token endpoint to get appaccess token
// currently only on analytics:read:games scope
function getAppAccessToken(clientId, clientSecret){
    axios.post('https://id.twitch.tv/oauth2/token?client_id='+clientId+'&client_secret='+clientSecret+'&grant_type=client_credentials&scope=analytics:read:games')
    .then((response) => {
        console.log('{$response.statusCode}'); //print http status
        //check if response has access_token included, if so set it as the current token, else error and print full response
        (response.data.hasOwnProperty('access_token')) ? (console.log("got access token"), currentToken = response.data.access_token) : console.log("error getting access token full response: \n", response);
    }).catch((e) => {console.error(e)})
}

function refreshAppAccessToken(clientId, clientSecret, refreshToken){
    axios.post('https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token='+refreshToken+'&client_id='+clientId+'&client_secret='+clientSecret)
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

function getUserAccessToken(clientId, clientSecret){
    //check if userAccessToken is valid, then stop
    //else initCallback
}

getAppAccessToken(twitchClientId, twitchClientSecret);


