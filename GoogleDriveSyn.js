
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
        this.directory = localStorage.getItem('directory');
    }

    getAllFilesInFolder(folderId) {
        var query = '"' + folderId + '"' + ' in parents and mimeType!="application/vnd.google-apps.folder"';
        service.files.list({
            auth: this.oauth2Client,
            q: query,
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

    downloadFile(fileId, filePath) {
        fullPath = path.join(this.directory, filePath);
        var dest = fs.createWriteStream(filePath);
        service.files.get({
            fileId: fileId,
            alt: 'media'
        })
        .on('end',function () {
            console.log('Done');
        })
        .on('error', function (err) {
            console.log('Error during download', err);
        })
        .pipe(dest);
    }
}

module.exports = GoogleDriveSyn;