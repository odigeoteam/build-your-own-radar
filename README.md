[![Build Status](https://travis-ci.org/thoughtworks/build-your-own-radar.svg?branch=master)](https://travis-ci.org/thoughtworks/build-your-own-radar)

A library that generates an interactive radar, inspired by [thoughtworks.com/radar](http://thoughtworks.com/radar).

## Demo

You can see this in action at https://radar.thoughtworks.com. If you plug in [this data](https://docs.google.com/spreadsheets/d/1YXkrgV7Y6zShiPeyw4Y5_19QOfu5I6CyH5sGnbkEyiI/) you'll see [this visualization](https://radar.thoughtworks.com/?sheetId=1YXkrgV7Y6zShiPeyw4Y5_19QOfu5I6CyH5sGnbkEyiI). 

## How To Use

This is a modified version of the tool to bypass the limitation of providing *public* Google Sheet.

### Setting up your data

Create a Google Sheet. Give it at least the below column headers, and put in the content that you want:

| name          | ring   | quadrant               | isNew | description                                             |
|---------------|--------|------------------------|-------|---------------------------------------------------------|
| Composer      | adopt  | tools                  | TRUE  | Although the idea of dependency management ...          |
| Canary builds | trial  | techniques             | FALSE | Many projects have external code dependencies ...       |
| Apache Kylin  | assess | platforms              | TRUE  | Apache Kylin is an open source analytics solution ...   |
| JSF           | hold   | languages & frameworks | FALSE | We continue to see teams run into trouble using JSF ... |

### Setting up the credentials

* [Turn on the Google Sheets API](https://developers.google.com/sheets/api/quickstart/nodejs). Make sure to follow the steps and put client_secret.json on src directory.
* start the app with `npm start`.
* open [http://localhost:3100/?sheetId=1waDG0_W3-yNiAaUfxcZhTKvl7AUCgXwQw8mdPjCz86U]()
* The first time you run it, it will prompt you to authorize access.  
* Browse to the provided URL in your web browser. If you are not already logged into your Google account, you will be prompted to log in. If you are logged into multiple Google accounts, you will be asked to select one account to use for the authorization.
* Click the Accept button.
* Copy the code you're given, paste it into the command-line prompt, and press Enter.

### Building the radar

Paste the URL in the input field on the home page.

That's it!

Note: the quadrants of the radar, and the order of the rings inside the radar will be drawn in the order they appear in your Google Sheet.

## Contribute

All tasks are defined in `package.json`.

Pull requests are welcome; please write tests whenever possible. 
Make sure you have nodejs installed.

- `git clone git@github.com:odigeoteam/build-your-own-radar.git`
- `npm install`
- `npm start` - to run your tests

### Don't want to install node? Run with one line docker

     $ docker run -p 8080:8080 -v $PWD:/app -w /app -it node:7.3.0 /bin/sh -c 'npm install && npm run dev'

After building it will start on localhost:8080
