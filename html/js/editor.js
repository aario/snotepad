(function($) {
    "use strict"; // Start of use strict
    let isFileNew
    let easyMDE = null; // Variable to hold the EasyMDE instance
    let currentHighlights = []; // Array to keep track of highlighted text markers
    let alreadyConfirmed = false;

    // Function to clear previous search highlights
    function clearSearchHighlights() {
        if (easyMDE && easyMDE.codemirror) {
            currentHighlights.forEach(marker => marker.clear());
        }
        currentHighlights = [];
    }

    // Function to perform the search and highlight
    function performSearch(searchTerm) {
        clearSearchHighlights(); // Clear previous highlights first

        if (!easyMDE || !easyMDE.codemirror || !searchTerm) {
            return; // Exit if editor isn't ready or search term is empty
        }

        const cm = easyMDE.codemirror;
        const query = searchTerm;
        // Start search from the beginning of the document, case-insensitive
        let cursor = cm.getSearchCursor(query, { line: 0, ch: 0 }, { caseFold: true });

        while (cursor.findNext()) {
            // Highlight the found match
            const marker = cm.markText(cursor.from(), cursor.to(), {
                className: 'search-highlight' // Add a CSS class for styling
            });
            currentHighlights.push(marker); // Store the marker to clear it later
        }

        // Optional: Scroll to the first match if found
        if (currentHighlights.length > 0) {
            const firstMatchPos = currentHighlights[0].find().from;
             // Check if find() returned a valid position before scrolling
            if (firstMatchPos) {
                cm.scrollIntoView(firstMatchPos, 100); // 100 is margin in pixels
            }
        }
    }

    // Debounce function to limit how often performSearch runs
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Create a debounced version of the search function
    const debouncedSearch = debounce(performSearch, 300); // Wait 300ms after typing stops

    // Define the function that should be called for settings
    window.editorNewFile = (path) => {
        console.log("editorNewFile function called!");
        lunchEditor(path, true)
    }

    window.editorOpenFile = (path) => {
        console.log("editorOpenFile function called!");
        lunchEditor(path, false)
    }

    let confirmExit = (callback) => {
        if (easyMDE.codemirror.isClean()) {
            callback(true)

            return
        }

        window.confirmModal(
            'Discard Changes',
            'Are you sure you want to discard changes?',
            () => {
                callback(true)
            }
        )
    }

    function lunchEditor(path, isNew) {
        window.showLoading('Loading file...')
        window.setNavBar('navbar-editor',{})

        isFileNew = isNew
        if (isNew) {
            window.editorReadFileCallback(path)

            return
        }

        window.requestReadFile(path, window.editorReadFileCallback)
        window.historyPush(
            lunchEditor,
            [path, isNew],
            confirmExit
        )
    }

    window.editorWriteFileCallback= (result, isError) => {
        if (isError) {
            window.showToast(result, isError)

            return
        }

        isFileNew = false
        const path = result
        const folderName = window.getHumanReadableBasename(window.dirname(path))
        const filename = window.basename(path)
        $('#filename').val(filename)
        easyMDE.codemirror.markClean()
        window.hideLoading()
        window.showToast('Saved to:<br/><i>' + folderName + '/' + filename + '</i>')
    }

    window.editorReadFileCallback = (result, content, isError) => {
        if (isError) {
            window.showToast(result, isError)

            return
        }

        const path = result

        window.setPage(
            'editor',
            {
                'path': path,
                'basename': isFileNew ? 'Untitled' : window.basename(path),
                'content': isFileNew ? '' : content,
            }
        );


        var $editorElement = $('#markdown-editor');
        // Check if EasyMDE is defined (it might be loaded asynchronously or conditionally)
        if (typeof EasyMDE !== 'undefined') {
            if ($editorElement.length > 0) {
                easyMDE = new EasyMDE({
                    element: $editorElement[0],
                    spellChecker: false,
                    autoDownloadFontAwesome: false,
                    toolbar: [
                        "bold", "italic", "heading", "|",
                        "quote", "unordered-list", "ordered-list", "|",
                        "link", "|",
                        "preview", // Maybe "side-by-side", "fullscreen" if desired
                        "undo", // Add this
                        "redo"  // Add this
                    ]
                });

                $('#btn-save').off('click');
                $('#btn-save').on('click', (event) => {
                    event.preventDefault()
                    window.showLoading('Saving file...')
                    let path = $("#editor-path").text()
                    if (isFileNew) {
                        let filename = $("#filename").val().trim()
                        if (filename === '') {
                            window.showToast('Please first enter a filename.', true)
                            return
                        }

                        path = path + '/' + filename
                    } else {
                        //In case the user wants to change the filename we always save in the same original folder, with the new name
                        const origPath = window.dirname(path)
                        path = origPath + '/' + $("#filename").val().trim()
                    }

                    easyMDE.codemirror.save()

                    // Defer value retrieval and saving to the next event loop tick
                    setTimeout(() => {
                        // Try getting the value *inside* the timeout
                        const content = easyMDE.value();
                        window.requestWriteFile(path, content, window.editorWriteFileCallback)
                    }, 100);
                })

                $('#btn-editor-toolbar').on('click', function(e) {
                    // Prevent the default action (e.g., following the href="#")
                    e.preventDefault();
                    var $editorToolbar = $('.editor-toolbar');
                    var $toggleButton = $('#btn-editor-toolbar');
                    $editorToolbar.toggleClass('fixed-editor-toolbar');
                    // Get the top offset of the editor toolbar relative to the document
                    var toolbarTopOffset = $editorToolbar.offset().top;
                    // Get the current vertical scroll position of the window
                    var offsetThreshold = $("#content").offset().top
                    // Check if the top of the toolbar is above the top of the viewport
                    if (toolbarTopOffset > offsetThreshold && !$editorToolbar.hasClass("fixed-editor-toolbar")) {
                        // Toolbar is still visible (or below the scrolled position)
                        $toggleButton.hide(); // Or use .fadeOut() for a smooth effect
                    }
                });

                console.log('EasyMDE Initialized Successfully!');
            } else {
                // Only log error if the *element* is missing, not if EasyMDE library is missing
                console.error('Error: Textarea element with ID "markdown-editor" not found.');
            }
        } else {
            // Optional: Log if EasyMDE library itself isn't loaded when the script runs
            // Be cautious if EasyMDE is loaded later; this might log unnecessarily.
            // console.warn('EasyMDE library not found when easymde-init.js executed.');
            if ($editorElement.length > 0) {
                console.warn('EasyMDE library not found, cannot initialize editor for #markdown-editor.');
            }
        }

        window.hideLoading()
        window.hideSidebar()
        $('#btn-editor-toolbar').hide();
    }

    window.getEditorCurrentPath = () => {
        return $("#editor-path").text();
    }

    // Add Event Listener for Search Input (Use Event Delegation)
    // This ensures the listener works even if the inputs are re-rendered,
    // and it only needs to be attached once.
    $(document).on('input', '.file-search-input', function() {
        const searchTerm = $(this).val();
        // Optional: Sync the value to the other search input
        $('.file-search-input').not(this).val(searchTerm);
        // Perform the debounced search
        debouncedSearch(searchTerm.trim());
    });
    $(document).on('focus', '.file-search-input', function() {
        const searchTerm = $(this).val().trim();
        if (searchTerm.length) {
            performSearch(searchTerm)
        }
    })
    $(document).on('blur', '.file-search-input', function() {
        clearSearchHighlights()
    })

    $('#btn-editor-toolbar').hide();
    // Function to check the toolbar's position and toggle the button
    $(".container-fluid").on('scroll', function() {
        // Cache the jQuery objects for performance
        var $editorToolbar = $('.editor-toolbar');
        var $toggleButton = $('#btn-editor-toolbar');
        if ($editorToolbar.length && $toggleButton.length) {
            // Get the top offset of the editor toolbar relative to the document
            var toolbarTopOffset = $editorToolbar.offset().top;

            // Get the current vertical scroll position of the window
            var offsetThreshold = $("#content").offset().top

            // Check if the top of the toolbar is above the top of the viewport
            if (toolbarTopOffset < offsetThreshold) {
                // Toolbar is scrolled out of view (above the viewport)
                $toggleButton.show(); // Or use .fadeIn() for a smooth effect
            } else if (!$editorToolbar.hasClass("fixed-editor-toolbar")) {
                // Toolbar is still visible (or below the scrolled position)
                $toggleButton.hide(); // Or use .fadeOut() for a smooth effect
            }
        }
    });
})(jQuery); // End of use strict
