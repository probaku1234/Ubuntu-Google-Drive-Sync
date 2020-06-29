
const path = require('path')
const {google} = require('googleapis');
const fs = require('fs');
const service = google.drive('v3');

class GoogleDriveSyn {
    constructor(auth) {
        this.auth = auth;
    }

    getAllFilesInFolder(folderId) {
        service.files.list({
            auth: this.auth,
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