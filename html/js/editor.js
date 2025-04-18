(function($) {
    let isFileNew

    // Define the function that should be called for settings
    window.editorNewFile = (path) => {
        console.log("editorNewFile function called!");
        lunchEditor(path, true)
    }

    window.editorOpenFile = (path) => {
        console.log("editorOpenFile function called!");
        lunchEditor(path, false)
    }

    function lunchEditor(path, isNew) {
        window.setNavBar('navbar-editor',{})

        isFileNew = isNew
        if (isNew) {
            window.editorReadFileSuccess(path)

            return
        }

        window.requestReadFile(path, window.editorReadFileSuccess)
    }

    window.editorWriteFileSuccess = (path) => {
        isFileNew = false
        window.showToast('Saved to:<br/><i>' + path + '</i>')
    }

    window.editorReadFileSuccess = (path, content) => {
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
                let easyMDE = new EasyMDE({
                    element: $editorElement[0],
                    spellChecker: false,
                    autoDownloadFontAwesome: false,
                    toolbar: [
                        "bold", "italic", "heading", "|",
                        "quote", "unordered-list", "ordered-list", "|",
                        "link", "image", "|",
                        "preview", // Maybe "side-by-side", "fullscreen" if desired
                        "guide", "|",
                        "undo", // Add this
                        "redo"  // Add this
                    ]
                });

                $('#btn-save').on('click', (event) => {
                    event.preventDefault()
                    let path = $("#editor-path").text()
                    if (isFileNew) {
                        let filename = $("#filename").val().trim()
                        if (filename === '') {
                            window.showToast('Please first enter a filename.', true)
                            return
                        }

                        path = path + '/' + filename
                    }

                    const content = easyMDE.codemirror.getValue()
                    console.log('Saving content', content)
                    window.requestWriteFile(path, content, window.editorWriteFileSuccess)
                })

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
    }

    window.getEditorCurrentPath = () => {
        return $("#editor-path").text();
    }
})(jQuery); // End of use strict
