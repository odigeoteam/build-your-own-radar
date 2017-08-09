'use strict';
// https://developers.google.com/sheets/api/quickstart/nodejs

const fs = require('fs');
const readline = require('readline');
const GoogleAuth = require('google-auth-library');
const q = require('q');

const TOKEN_PATH = __dirname + '/sheetsandrive.googleapis.com-nodejs-techradar.json';
const credentials = require('./client_secret.json');

// If modifying these scopes, delete your previously saved credentials
const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'];

/**
 * Create an OAuth2 client with the given credentials, and then execute the given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // getNewToken(oauth2Client, callback);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client - The OAuth2 client to get token for.
 * @param {getEventsCallback} callback - The callback to call with the authorized client.
 */
function getNewToken(oauth2Client, callback) {
    console.log('getNewToken');
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // eslint-disable-line camelcase
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}
/**
 * Auths
 * @return {Promise}
 */
const googleAuthWrapper = function() {
    const defer = q.defer();

    authorize(credentials, function(auth) {
        defer.resolve(auth);
    });

    return defer.promise;
};

module.exports = googleAuthWrapper;
