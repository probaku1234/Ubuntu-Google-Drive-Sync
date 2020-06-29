// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.$ = window.jQuery = require('jquery');
const {ipcRenderer} = require('electron');
const { dialog } = require('electron').remote
const GoogleDriveSyn = require('./GoogleDriveSyn');

var googleSyn;
var directory = localStorage.getItem('directory') ? localStorage.getItem('directory') : undefined;

if (directory != undefined) {
    $('#folder_path').val(directory);
}

$('#change_folder_button').click(function () {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);

        if (!result.canceled) {
            directory = result.filePaths[0];
            localStorage.setItem('directory', directory);
            $('#folder_path').val(directory);

        }
    }).catch(err => {
        console.log(err);
    });
});

ipcRenderer.on('load-files', function(event, data) {
    console.log('received data');

    $.each(data, function(index ,value) {
        $('#folder_list').append('<button type="button" class="list-group-item list-group-item-action">' + value['name'] + '</button>');
    });
});

ipcRenderer.on('auth', function(event, data) {
    googleSyn = new GoogleDriveSyn(data);
    //googleSyn.getAllFilesInFolder('0B2k9Kxcv0FOZR2Fhc21Mc1Z0VEU');
});