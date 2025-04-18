(function($) {
    var currentPath = ''
    // Define the function that should be called for settings
    window.lunchFolderView = (path) => {
        console.log("lunchFolderView function called!");

        window.setNavBar('navbar-folderView', {});

        window.setPage(
            'folderView',
            {
                'path': path,
                'basename': window.basename(path)
            }
        );
        $('#btn-add-file').on('click', function() {
            let path = $("#div-folderView-path").text()
            window.editorNewFile(path)
        });
        window.requestReadFolder(path, window.folderViewReadFolderSuccess)
    }

    window.folderViewReadFolderSuccess = (path, folderContentJson) => {
        const $filesDiv = $("#files");
        const folderContent = JSON.parse(folderContentJson)
        $filesDiv.empty()
        $.each(folderContent, (i, file) => {
            $filesDiv.append(
                window.renderTemplate(
                    {
                        'path': path + '/' + file.filename,
                        'basename': file.filename,
                        'date': file.date,
                        'id': i
                    },
                    'folderView-file'
                )
            )
        })

        $('.btn-file-delete').on('click', function(button) {
            let id = $(this).data('id')
            let path = $('#div-file-path-' + id).text()
            window.deleteFile(path)
            $('#div-file-' + id).remove()
        })

        $('.div-file-open').on('click', function(button) {
            let id = $(this).data('id')
            let path = $('#div-file-path-' + id).text()
            window.editorOpenFile(path)
        })
    }
})(jQuery); // End of use strict
