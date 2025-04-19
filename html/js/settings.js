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

        window.hideSidebar()
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

        // Get the modal instance
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));

        // Handle the click on the final confirmation button inside the modal
        $('#confirmBtn').off('click').on('click', function() {
            if (folderToReleaseId !== null && $itemToDelete) {
                let path = $('#code-folder-path-' + folderToReleaseId).text()
                console.log("Releasing folder with path:", path);
                window.releaseFolder(path)

                // Hide the modal
                confirmModal.hide();

                $itemToDelete.fadeOut(300, function() {
                    $(this).remove();
                });


                window.showToast('Folder released:<br/>' + folderToReleaseName)
                // Reset the stored variables
                folderToReleaseId = null;
                $itemToDelete = null;
            } else {
                console.error("Could not find folder ID or element to delete.");
                confirmModal.hide(); // Hide modal even if error occurs
            }
        });

        // Optional: Clear stored data when modal is closed without confirming
        $('#confirmModal').on('hidden.bs.modal', function () {
            if (folderToReleaseId !== null) { // Only reset if deletion wasn't confirmed
                // console.log("Modal closed without confirmation, resetting.");
                folderToReleaseId = null;
                $itemToDelete = null;
                folderToReleaseName = null;
            }
        });

        $('.btn-folder-delete').on('click', function(button) {
            folderToReleaseId = $(this).data('id')
            $itemToDelete = $('#div-folder-' + folderToReleaseId)
            folderToReleaseName = $('#div-folder-name-' + folderToReleaseId).text()

            $('#confirmModalLabel').text('Release Folder')
            $('#confirmModalMessage').html('Are you sure you want to release this folder?<br/><i>Folder and its contents still remain on your device</i><br/><br/>' + folderToReleaseName)

            // Show the modal
            confirmModal.show();
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

