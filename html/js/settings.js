(function($) {
    let confirmExit = (callback) => {
        callback(true)
    }

    // --- Update UI Controls ---
    const updateAppearanceUI = (selectedTheme, selectedMode) => {
        // Update Theme Selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = selectedTheme;
        } else {
            console.warn("Theme select element not found");
        }

        // Update Mode Radios
        const modeRadio = document.querySelector(`input[name="ui-mode"][value="${selectedMode}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
        } else {
             console.warn(`Mode radio for value "${selectedMode}" not found`);
             // Fallback check 'auto' if invalid value somehow stored
             const autoRadio = document.querySelector('input[name="ui-mode"][value="auto"]');
             if (autoRadio) autoRadio.checked = true;
        }
    };

    window.lunchSettings = () => {
        console.log("lunchSettings function called!");

        window.setNavBar('navbar-settings', {});

        window.setPage('settings', {});

        // --- Initialize Appearance ---
        const initialTheme = window.getStoredTheme();
        const initialMode = window.getStoredMode();
        updateAppearanceUI(initialTheme, initialMode);

        // --- Event Listener for Theme Selector ---
        const themeSelect = document.getElementById('themeSelect');
        if(themeSelect) {
            themeSelect.addEventListener('change', (event) => {
                const newTheme = event.target.value;
                const currentMode = window.getStoredMode(); // Get current mode setting
                window.setStoredTheme(newTheme);       // Store the new theme choice
                window.applyAppearance(newTheme, currentMode); // Apply the new theme with current mode
            });
        } else {
             console.error("Theme select element not found during event listener setup");
        }


        // --- Event Listeners for Mode Radio Buttons ---
        document.querySelectorAll('input[name="ui-mode"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                const newMode = event.target.value;
                const currentTheme = window.getStoredTheme(); // Get current theme setting
                window.setStoredMode(newMode);         // Store the new mode choice
                window.applyAppearance(currentTheme, newMode); // Apply the current theme with new mode
            });
        });

        $('#btn-add-folder').on('click', function() {
            window.requestFolderSelection()
        })

        window.settingsUpdateFolders(
            JSON.parse(
                window.readPreferences('paths')
            )
        )

        window.hideSidebar()
        window.historyPush(
            window.lunchSettings,
            [],
            confirmExit
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
                        'basename': window.getHumanReadableBasename(path),
                        'path': path,
                        'id': i
                    },
                    'settings-folder'
                )
            )
        })


        let folderToReleaseId = null; // Variable to store the ID of the file to delete
        let $itemToDelete = null; // Variable to store the jQuery element to remove
        let folderToReleaseName = null

        $('.btn-folder-delete').on('click', function(button) {
            folderToReleaseId = $(this).data('id')
            $itemToDelete = $('#div-folder-' + folderToReleaseId)
            folderToReleaseName = $('#div-folder-name-' + folderToReleaseId).text()

            window.confirmModal(
                'Release Folder',
                'Are you sure you want to release this folder?<br/><i>Folder and its contents still remain on your device</i><br/><br/>' + folderToReleaseName,
                () => {
                    if (folderToReleaseId !== null && $itemToDelete) {
                        let path = $('#code-folder-path-' + folderToReleaseId).text()
                        console.log("Releasing folder with path:", path);
                        window.releaseFolder(path)

                        $itemToDelete.fadeOut(300, function() {
                            $(this).remove();
                        });


                        window.showToast('Folder released:<br/>' + folderToReleaseName)
                        // Reset the stored variables
                        folderToReleaseId = null;
                        $itemToDelete = null;
                    } else {
                        console.error("Could not find folder ID or element to delete.");
                    }
                }
            )
        })
        // Destroy previous instance if it exists to prevent duplicates
        if (window.settingsSortableInstance) {
             window.settingsSortableInstance.destroy();
        }
        window.settingsSortableInstance = new Sortable(($("#folders")[0]), {
            handle: '.drag-handle',
            animation: 150,
            onEnd: () => {
                let paths = [];

                $('#folders').find('.folder-path').each(function() {
                    paths.push($(this).text())
                })
                window.writePreferences('paths', JSON.stringify(paths))
                window.sidebarUpdateFolders(paths)
            }
        })
    }
})(jQuery); // End of use strict

