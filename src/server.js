'use strict';

const PORT = 3100;

const express = require('express');
const cors = require('cors');
const q = require('q');
const path = require('path');

const app = express();

const googleAuthWrapper = require('./gauthwrapper');
const google = require('googleapis');

app.use(cors());

/**
 * retrieves the contents of a google sheet:
 * https://docs.google.com/spreadsheets/d/1waDG0_W3-yNiAaUfxcZhTKvl7AUCgXwQw8mdPjCz86U
 * @param {*} auth - Auth object from google auth wrapper.
 * @param {String} spreadsheetId - id of the file to download.
 * @return {Promise} - promise that will be resolved after the operation is completed
 */
function get(auth, spreadsheetId) {
    const defer = q.defer();
    const spreadsheets = google.sheets('v4').spreadsheets;

    spreadsheets.values.get({
        auth,
        range: 'A:E',
        spreadsheetId,
    }, function(err, response) {
        if (err) {
            console.error(err);
            defer.reject(err);
        } else {
            defer.resolve(response);
        }
    });
    return defer.promise;
}

app.get('/feed/:id', function (req, res) {
    return googleAuthWrapper().then(function(auth) {
        return get(auth, req.params.id);
    }).then(function (a) {
        res.send(a);
    }).catch(function(e) {
        res.status(500).send(e);
    });
});

const publicPath = path.join(__dirname, '..', 'dist');

app.get('/', function(req, res) {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.use('/', express.static(publicPath));

app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
});
