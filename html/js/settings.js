(function($) {
    // Define the function that should be called for settings
    window.lunchSettings = () => {
        console.log("lunchSettings function called!");

        window.setNavBar('navbar-settings', {});

        window.setPage('settings', {});
        $('#btn-add-folder').on('click', function() {
            window.requestFolderSelection()
        });


        // Update radio buttons to reflect the initial theme (use stored theme or default 'auto')
        updateRadioUI(window.getStoredTheme() || 'auto');


        // --- Add event listeners to the theme radio buttons ---
        document.querySelectorAll('input[name="theme"]')
            .forEach(radio => {
                radio.addEventListener('change', (event) => {
                    // When a radio button is selected
                    const theme = event.target.value;
                    window.setStoredTheme(theme); // Store the user's explicit choice
                    window.setTheme(theme);      // Apply the chosen theme immediately
                    // No need to call updateRadioUI here, the browser handles checking the clicked radio
                })
            })

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
            window.releaseFolder(path)
        })
    }

    // --- NEW: Function to update the checked state of radio buttons ---
    const updateRadioUI = (theme) => {
        // Find the radio button whose value matches the theme and check it
        const themeRadio = document.querySelector(`input[name="theme"][value="${theme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        } else {
            // Fallback if somehow the theme value is invalid - check 'auto' maybe?
            const autoRadio = document.querySelector('input[name="theme"][value="auto"]');
            if (autoRadio) autoRadio.checked = true;
        }
    }
})(jQuery); // End of use strict

