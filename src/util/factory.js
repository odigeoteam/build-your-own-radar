const d3 = require('d3');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const InputSanitizer = require('./inputSanitizer');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const SheetNotFoundError = require('../exceptions/sheetNotFoundError');
const ContentValidator = require('./contentValidator');
const getSheet = require('./sheet');
const ExceptionMessages = require('./exceptionMessages');


const GoogleSheet = function (sheetId) {
    const self = {};

    self.build = function () {
        getSheet(sheetId.replace(/.*\/spreadsheets\/d\//, '').replace(/\/.*/, ''), function(notFound, response) {
            if (notFound) {
                displayErrorMessage(notFound);
                return;
            }

            const headers = response.values.shift();
            const values = response.values.map(function(row) {
                const rowObj = {};
                row.forEach(function(elem, i) {
                    rowObj[headers[i]] = elem;
                });

                return rowObj;
            });

            createRadar(values, headers, response.range.replace(/!.*/, '').replace(/'/g, ''));
    });

        function displayErrorMessage(exception) {
            d3.selectAll(".loading").remove();
            var message = 'Oops! It seems like there are some problems with loading your data. ';

            if (exception instanceof MalformedDataError) {
                message = message.concat(exception.message);
            } else if (exception instanceof SheetNotFoundError) {
                message = exception.message;
            } else {
                console.error(exception);
            }

            message = message.concat('<br/>', 'Please check <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#faq">FAQs</a> for possible solutions.');

            d3.select('body')
                .append('div')
                .attr('class', 'error-container')
                .append('div')
                .attr('class', 'error-container__message')
                .append('p')
                .html(message);
        }

        function createRadar(data, columnNames, sheetName) {

            try {
                const contentValidator = new ContentValidator(columnNames);
                contentValidator.verifyContent();
                contentValidator.verifyHeaders();

                const all = data;
                const blips = _.map(all, new InputSanitizer().sanitize);

                document.title = sheetName;
                d3.selectAll(".loading").remove();

                const rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
                const ringMap = {};
                const maxRings = 4;

                _.each(rings, function (ringName, i) {
                    if (i === maxRings) {
                        throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
                    }
                    ringMap[ringName] = new Ring(ringName, i);
                });

                const quadrants = {};
                _.each(blips, function (blip) {
                    if (!quadrants[blip.quadrant]) {
                        quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
                    }
                    quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
                });

                const radar = new Radar();
                _.each(quadrants, function (quadrant) {
                    radar.addQuadrant(quadrant)
                });

                const size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

                new GraphingRadar(size, radar).init().plot();

            } catch (exception) {
                displayErrorMessage(exception);
            }
        }
    };

    self.init = function () {
        const content = d3.select('body')
            .append('div')
            .attr('class', 'loading')
            .append('div')
            .attr('class', 'input-sheet');

        set_document_title();

        plotLogo(content);

        const bannerText = '<h1>Building your radar...</h1><p>Your Technology Radar will be available in just a few seconds</p>';
        plotBanner(content, bannerText);
        plotFooter(content);


        return self;
    };

    return self;
};

const QueryParams = function (queryString) {
    const decode = function (s) {
        return decodeURIComponent(s.replace(/\+/g, " ").replace('\''));
    };

    const search = /([^&=]+)=?([^&]*)/g;

    const queryParams = {};
    var match;
    while (match = search.exec(queryString))
        queryParams[decode(match[1])] = decode(match[2]);

    return queryParams
};


const GoogleSheetInput = function () {
    const self = {};

    self.build = function () {
        const queryParams = QueryParams(window.location.search.substring(1));

        if (queryParams.sheetId) {
            const sheet = GoogleSheet(queryParams.sheetId);
            sheet.init().build();
        } else {
            const content = d3.select('body')
                .append('div')
                .attr('class', 'input-sheet');

            set_document_title();

            plotLogo(content);

            const bannerText = '<h1>Build your own radar</h1><p>Once you\'ve <a href ="https://info.thoughtworks.com/visualize-your-tech-strategy.html">created your Radar</a>, you can use this service' +
                ' to generate an <br />interactive version of your Technology Radar. Not sure how? <a href ="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html">Read this first.</a></p>';

            plotBanner(content, bannerText);

            plotForm(content);

            plotFooter(content);

        }
    };

    return self;
};

function set_document_title() {
    document.title = "Build your own Radar";
}

function plotLogo(content) {
    content.append('div')
        .attr('class', 'input-sheet__logo')
        .html('<a href="https://www.thoughtworks.com"><img src="/images/tw-logo.png" / ></a>');
}

function plotFooter(content) {
    content
        .append('div')
        .attr('id', 'footer')
        .append('div')
        .attr('class', 'footer-content')
        .append('p')
        .html('Powered by <a href="https://www.thoughtworks.com"> ThoughtWorks</a>. This is a modified version by <a href="http://www.edreamsodigeo.com/"   >eDreams Odigeo</a>. '
        + 'By using this service you agree to <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-terms-of-service.html">ThoughtWorks\' terms of use</a>. '
        + 'You also agree to our <a href="https://www.thoughtworks.com/privacy-policy">privacy policy</a>, which describes how we will gather, use and protect any personal data contained in your public Google Sheet. '
        + 'This software is <a href="https://github.com/thoughtworks/build-your-own-radar">open source</a> and available for download and self-hosting.');
}

function plotBanner(content, text) {
    content.append('div')
        .attr('class', 'input-sheet__banner')
        .html(text);
}

function plotForm(content) {
    content.append('div')
        .attr('class', 'input-sheet__form')
        .append('p')
        .html('<strong>Enter the URL of your <u>non published</u> Google Sheet below…</strong>');

    var form = content.select('.input-sheet__form').append('form')
        .attr('method', 'get');

    form.append('input')
        .attr('type', 'text')
        .attr('name', 'sheetId')
        .attr('placeholder', 'e.g. https://docs.google.com/spreadsheets/d/1waDG0_W3-yNiAaUfxcZhTKvl7AUCgXwQw8mdPjCz86U/');

    form.append('button')
        .attr('type', 'submit')
        .append('a')
        .attr('class', 'button')
        .text('Build my radar');

    form.append('p').html("<a href='https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#faq'>Need help?</a>");
}

module.exports = GoogleSheetInput;
