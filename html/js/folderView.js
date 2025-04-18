(function($) {
    // Define the function that should be called for settings
    window.lunchFolderView = (path) => {
        console.log("lunchFolderView function called!");

        window.setNavBar('navbar-folderView', {});

        window.setPage(
            'folderView',
            {
                'basename': window.basename(path)
            }
        );
        $('#btn-add-file').on('click', function() {
            let path = $("#div-folderView-path").text()
            window.editorNewFile(path)
        });

        const $filesDiv = $("#files");
        $filesDiv.empty()
        const files = window.listFiles(path)
        $.each(files, (i, file) => {
            $filesDiv.append(
                window.renderTemplate(
                    {
                        'basename': window.basename(file.path),
                        'path': file.path,
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
    window.getFolderViewrCurrentPath = () => {
        return '';
    }
})(jQuery); // End of use strict
