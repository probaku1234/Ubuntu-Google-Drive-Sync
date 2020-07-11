// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu} = require('electron')
const path = require('path')
const {google} = require('googleapis');
const fs = require('fs');
const service = google.drive('v3');
const iconPath = path.join(__dirname, 'icon.png');
var http = require('http');
var https = require('https');
const { create } = require('domain');

let mainWindow;
var appIconTray;
var AUTH = undefined;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    mainWindow = null;
  });
}

function createTray() {
  appIconTray = new Tray(iconPath);
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App', click: function() {
        mainWindow.show()
      }
    },
    {
      label: 'Quit', click: function() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  appIconTray.setToolTip('Wallpaper App');
  appIconTray.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  createTray();

  var OAuth2 = google.auth.OAuth2;
  var spawn = require('child_process').spawn;
  var url = require('url');
  var querystring = require('querystring');

  var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
                   process.env.USERPROFILE) + '/.credentials/';
  var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
  
  var apiKeys = JSON.parse(fs.readFileSync('config.json'));
  
  var oauth2Client = new OAuth2(
    apiKeys['CLIENT_ID'], //< CLIENT_ID >
    apiKeys['SECRET_ID'], // < SECRET_ID >
    "http://localhost:8080" // addr of our web server that will be listening
  );
  
  function callback(auth) {
    service.files.list({
      auth: auth,
      q: '"root" in parents and mimeType="application/vnd.google-apps.folder"',
      pageSize: 50,
      fields: "nextPageToken, files(id, name, modifiedTime, kind, createdTime, thumbnailLink, mimeType, size, webContentLink)"
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      var files = response['data'].files;
      if (files.length == 0) {
        console.log('No files found.');
      } else {
        mainWindow.send('auth', auth.credentials);
        mainWindow.send('load-files', files, auth.credentials.access_token);
        console.log(files);
      }
    });
  }

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    console.log(TOKEN_PATH);
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
      AUTH = oauth2Client;
    }
  });

  var scopes = [
    'https://www.googleapis.com/auth/drive'
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  


  function getNewToken(oauth2Client, callback) {
    
    function storeToken(token) {
      try {
        fs.mkdirSync(TOKEN_DIR);
      } catch (err) {
        if (err.code != 'EEXIST') {
          throw err;
        }
      }
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), function(error) {
        if (error) {
          console.log('[write error]: ' + error);
        } 
      });
      console.log('Token stored to ' + TOKEN_PATH);
    } 

    function handler (request, response, server, callback) {
      var qs = querystring.parse(require('url').parse(request.url).query);
      oauth2Client.getToken(qs.code, function (err, tokens) {
        if (err) {
          console.error('Error getting oAuth tokens: ' + err);
        }
        oauth2Client.credentials = tokens;
        mainWindow.loadURL('file://' + __dirname + '/index.html');
        storeToken(tokens);
        callback(oauth2Client);
        AUTH = oauth2Client;
        server.close();
      });
    }

    var server = http.createServer(function (request, response) {
      handler(request, response, server, callback);
    }).listen(8080, function () {
      mainWindow.loadURL(url);
    });

  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
