const twitchClientId = process.env.CLIENT_ID;
const twitchClientSecret = process.env.CLIENT_SECRET;
const twitchRedirectUri = "http://localhost:8080";

//userToken
var userToken = ""; //current user access token
var userRefreshToken; //current user refresh token

const axios = require('axios'); //node http req library
const crypto = require('crypto'); //for hash functions and random
const http = require('http'); //for callback/redirectUri
const url = require('url'); //parse url becuase i'm to lazy to regex

// Use an instance of axios with defaults for clarity
const twitchHttp = axios.create({
    baseURL: 'https://id.twitch.tv'
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
async function resolveToken(oauthCode,clientId,clientSecret) {
    try {
        let tokenResponse = await twitchHttp.post('/oauth2/token', null, {
            params:{
                client_id:clientId,
                client_secret:clientSecret,
                code:oauthCode,
                grant_type:"authorization_code",
                redirect_uri:twitchRedirectUri
            }
        })

        return tokenResponse.data
    } catch (e){console.error(e);}
}

// Scope is an array of twitch OAuth scopes e.g ['user:edit','user:read:broadcast']
// 
function getUserAccessToken(clientId, clientSecret, scope){
    //check if userAccessToken is valid, then stop
    
    
    //build oauth code request
    var oauthAuthorizeURI = "?client_id="+clientId+"&redirect_uri="+twitchRedirectUri+"&response_type=code&scope="+scope.join('+')
    //get CSRF state/string
    var csrfString = "&state="+crypto.randomBytes(32).toString('hex');    

    //create server with anonymous function callback, 
    //will close after one request to it (hopefully the right one)
    var server = http.createServer().on('error', (e) => {console.error(e); server.close()});
    
    //TODO use the Twitch Redirect URI
    server.listen({port:8080, host:"localhost"}, () => {
        console.log("Listening: "+server.address().address+":"+ server.address().port);
        console.log("Authenticate in Browser: \r\n","https://id.twitch.tv/oauth2/authorize"+oauthAuthorizeURI+csrfString);
    });
    
    server.on('request', async (req, res) => {

        //parse code from the request, it in ?code=<30 chars>
        query = url.parse(req.url, true).query
        
        //check state still exists, otherwise possible MiTM attack/poisoning
        res.write("Callback Request Recieved with State: "+query.state+"\n")

        
        if(Object.prototype.hasOwnProperty.call(query, 'code')){ 
            res.write("Code Received: "+query.code)
            resolveToken(query.code, clientId, clientSecret).then((data) => {res.end(data)}).catch((e) => res.end(e))
        } else {
            res.write("Error, Code not Received or auth request denied. Try again.")
            res.end()
            server.emit('error', new Error("Fatal. No Code recieved, cannot proceed."))
        }
        server.close() 
    });

}

//getAppAccessToken(twitchClientId, twitchClientSecret);
getUserAccessToken(twitchClientId, twitchClientSecret, ['user:edit', 'user:read:email', 'user:edit:follows'])

