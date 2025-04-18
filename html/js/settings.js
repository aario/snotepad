(function($) {
    // Define the function that should be called for settings
    window.lunchSettings = () => {
        console.log("lunchSettings function called!");

        window.setNavBar('navbar-settings', {});

        window.setPage('settings', {});
        $('#btn-add-folder').on('click', function() {
            window.requestFolderSelection()
        });

        window.settingsUpdateFolders(
            JSON.parse(
                window.readPreferences('paths')
            )
        )
    }

    window.settingsUpdateFolders = (paths) => {
        const $foldersDiv = $("#folders");
        if ($foldersDiv === undefined) {
            return
        }

        $foldersDiv.empty()
        $.each(paths, (i, path) => {
            $foldersDiv.append(
                window.renderTemplate(
                    {
                        'basename': window.basename(path),
                        'path': path,
                        'id': i
                    },
                    'settings-folder'
                )
            )
        })

        $('.btn-folder-delete').on('click', function(button) {
            let id = $(this).data('id')
            let path = $('#code-folder-path-' + id).text()
            window.deleteFolder(path)
        })
    }
})(jQuery); // End of use strict
