
const path = require('path')
const {google} = require('googleapis');
const fs = require('fs');
const service = google.drive('v3');

class GoogleDriveSyn {
    constructor(auth) {
        var apiKeys = JSON.parse(fs.readFileSync('config.json'));
        this.oauth2Client = new google.auth.OAuth2(
            apiKeys['CLIENT_ID'],
            apiKeys['SECRET_ID'], 
            "http://localhost:8080" 
        );
        this.oauth2Client.credentials = auth;
    }

    getAllFilesInFolder(folderId) {
        service.files.list({
            auth: this.oauth2Client,
            q: '"+' + folderId +'" in parents and not mimeType contains "python" and not mimeType contains "folder"',
            pageSize: 50,
            fields: 'nextPageToken, files(id, name, modifiedTime, kind, createdTime, thumbnailLink, mimeType, size, webContentLink)'
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
              }
              console.log(response);
        })
    }
}

module.exports = GoogleDriveSyn;