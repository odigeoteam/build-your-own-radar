const SheetNotFoundError = require('../../src/exceptions/sheetNotFoundError');
const ExceptionMessages = require('./exceptionMessages');

const Sheet = function (id, callback) {
    const feedURL = '/feed/' + id;

    // TODO: Move this out (as HTTPClient)
    const xhr = new XMLHttpRequest();
    xhr.open('GET', feedURL, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                return callback(null, JSON.parse(xhr.response));
            } else {
                return callback(new SheetNotFoundError(ExceptionMessages.SHEET_NOT_FOUND));
            }
        }
    };
    xhr.send(null);
};

module.exports = Sheet;
