const twitchClientId = process.env.CLIENT_ID;
const twitchClientSecret = process.env.CLIENT_SECRET;
const twitchRedirectUri = "http://localhost:8080";

//userToken
var userAccessToken = {accessToken:'', refreshToken:''};

const axios = require('axios'); //node http req library
const crypto = require('crypto'); //for hash functions and random
const http = require('http'); //for callback/redirectUri
const url = require('url'); //parse url becuase i'm to lazy to regex

// Use an instance of axios with defaults for clarity
const twitchHttp = axios.create({
    baseURL: 'https://id.twitch.tv'
});

//add a handler for all errors through the twitch api
twitchHttp.interceptors.response.use(response => response, error => { throw error });

//handle rejection dep warnings
process.on('unhandledRejection', e => {
    console.error(e.stack); //print the stack
    process.exit(1); //halt
});

//ensure client details are set
if(typeof twitchClientId == 'undefined' || typeof twitchClientSecret == 'undefined'){throw new Error("Client ID or Secret are not defined or the Envirpnment variables could not be found")}

//
// Post request to get a new token (refresh) that has expired, based on the existing oAuth details.
//
function refreshAccessToken(clientId, clientSecret, refreshToken){
    twitchHttp.post('/oauth2/token?grant_type=refresh_token&refresh_token='+refreshToken+'&client_id='+clientId+'&client_secret='+clientSecret)
    .then((response) =>{
        console.log('{$respone.statusCode}')
        console.log(response)    
    }).catch((e) => {console.error(e)})
}

//
// Get access token from a completed OAuth implicit flow.
//
function resolveToken(oauthCode,clientId,clientSecret) {
       return twitchHttp.post('/oauth2/token', null, {
            params:{
                client_id:clientId,
                client_secret:clientSecret,
                code:oauthCode,
                grant_type:"authorization_code",
                redirect_uri:twitchRedirectUri
            }
        });
}

// Scope is an array of twitch OAuth scopes e.g ['user:edit','user:read:broadcast']
// 
function getUserAccessToken(clientId, clientSecret, scope){
    //check if userAccessToken is valid, then stop
    
    
    //build oauth code request
    var oauthAuthorizeURI = "?client_id="+clientId+"&redirect_uri="+twitchRedirectUri+"&response_type=code&scope="+scope.join('+')
    //get CSRF state/string
    var csrfString = crypto.randomBytes(32).toString('hex');    

    //create server with anonymous function callback, 
    //will close after one request to it (hopefully the right one)
    var server = http.createServer().on('error', (e) => {console.error(e); server.close()});
    
    //TODO use the Twitch Redirect URI
    server.listen({port:8080, host:"localhost"}, () => {
        console.log("Listening: "+server.address().address+":"+ server.address().port);
        console.log("Authenticate in Browser: \r\n","https://id.twitch.tv/oauth2/authorize"+oauthAuthorizeURI+"&state="+csrfString);
    });
    
    server.on('request', (req, res) => {

        //parse code from the request, it in ?code=<30 chars>
        query = url.parse(req.url, true).query
        
        //write what we got
        res.write("Callback Request Recieved: "+JSON.stringify(query)+"\n")
       
        //check state, if altered then suspected CSRF
        if(csrfString !== query.state){
            res.end("CSRF are not matching, potential foul-play not continuing");
            server.close();
            process.exit(1);
        } else {
            res.write("CSRF Matches. \n");
        }

        let token = {};
        //did we get a code in the response?
        if("code" in query && query.code.length === 30){
            //we did, and it was 30 characters as expected
            res.write("Got Code, and it is 30 characters, trying to resolve oAuthCode:\n");
            //exchange it for an access token and output the accessToken object, or error.
            resolveToken(query.code, clientId, clientSecret)
                .then((responsePromise) => res.end(responsePromise.data))
                .catch((e) => (res.end("An Error Occured, Check the console."),console.log(e.stack)))
        }

        server.close() 

    });

}
getUserAccessToken(twitchClientId, twitchClientSecret, ['user:edit', 'user:read:email', 'user:edit:follows'])

