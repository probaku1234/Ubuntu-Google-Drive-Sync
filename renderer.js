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
var driveFolderId = localStorage.getItem('driveFolderId') ? localStorage.getItem('driveFolderId') : undefined;

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

$(function() {
    $('#toggle-event').on('change', function() {
        var isChecked = $(this).prop('checked')
        console.log(isChecked);
        
        if (isChecked) {
            $('#checkbox-p').html('Sync On');
        } else {
            $('#checkbox-p').html('Sync Off');
        }
    });
});

function onToggleChange() {
    console.log('qwe');
}

ipcRenderer.on('load-files', function(event, data) {
    console.log('received data');

    $.each(data, function(index ,value) {
        if (driveFolderId != undefined) {
            if (value['id'] == driveFolderId) {
                $('#folder_list').append('<button type="button" class="list-group-item list-group-item-action active">' + value['name'] + '</button>');
            }
        } else {
            $('#folder_list').append('<button type="button" class="list-group-item list-group-item-action">' + value['name'] + '</button>');
        }
    });
});

ipcRenderer.on('auth', function(event, data) {
    googleSyn = new GoogleDriveSyn(data);
    googleSyn.getAllFilesInFolder('1Op7sdBdrOEEEedlxqPeaR8PQFGa29wCn');
});