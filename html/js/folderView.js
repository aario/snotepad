(function($) {
    "use strict"; // Start of use strict

    // Fuse.js options
    const FUSE_OPTIONS = {
        // includeScore: true, // Uncomment to see scores for debugging/ranking
        // threshold: 0.4,    // Adjusts fuzziness (0=exact match, 1=match anything). Default 0.6 is often fine.
        keys: [
            {
                name: 'filename', // Field to search
                weight: 0.7       // Higher weight = more importance
            },
            {
                name: 'content',  // Field to search
                weight: 0.3       // Lower weight = less importance
            }
            // 'date' is intentionally omitted, so it won't be searched
        ]
    };

    var currentPath = ''
    var folderContent = []

    // Function to set the initial/default icon for the sort dropdown toggle
    function setDefaultSortIcon(iconClass) {
        $('#sortDropdown i').removeClass().addClass(iconClass + ' fa-fw'); // Remove existing classes, add new ones
    }

    function renderFolderContent() {
        const $itemsDiv = $("#items");
        $itemsDiv.empty()
        $.each(folderContent, (i, file) => {
            $itemsDiv.append(
                window.renderTemplate(
                    {
                        'path': currentPath + '/' + file.filename,
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

    function arrangeitems(sort, order) {
        folderContent = window.sortArray(folderContent, sort, order)
        renderFolderContent()
        window.writePreferences('sort', sort)
        window.writePreferences('order', order)
    }

    function performSearch(fuse, data, searchTerm) {
        searchTerm = searchTerm.trim(); // Remove leading/trailing whitespace
        console.log("Search triggered. Term:", searchTerm);

        let results = [];
        if (searchTerm) {
            // Perform the search using Fuse.js
            // Fuse returns an array of objects: { item: originalObject, refIndex: ..., score: ... }
            folderContent = fuse.search(searchTerm).map(result => result.item);;
        } else {
            folderContent = data;
        }

        // Display the results
        renderFolderContent();
    }

    // Define the function that should be called for settings
    window.lunchFolderView = (path) => {
        currentPath = path
        window.showLoading('Loading folder...')
        console.log("lunchFolderView function called!");

        window.setNavBar('navbar-folderView', {});

        window.setPage(
            'folderView',
            {
                'path': path,
                'basename': window.getHumanReadableFolderName(path)
            }
        );
        $('#btn-add-file').on('click', function() {
            let path = $("#div-folderView-path").text()
            window.editorNewFile(path)
        });

        window.requestReadFolder(path, window.folderViewReadFolderSuccess)
        window.writePreferences('lastPath', path)
    }

    window.folderViewReadFolderSuccess = (path, content) => {
        folderContent = content
        const lastSort = window.readPreferences('sort')
        const lastOrder = window.readPreferences('order')
        arrangeitems(
            lastSort === null ? 'date' : lastSort,
            lastOrder === null ? 'desc' : lastOrder
        )

        // Set the default icon on page load (using the one from your HTML)
        setDefaultSortIcon('fas fa-arrow-down-a-z');

        // Event handler for when a sort option is clicked
        $('[aria-labelledby="sortDropdown"] .dropdown-item').on('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior

            // Find the icon within the clicked item
            var $selectedIcon = $(this).find('.icon-circle i');
            var selectedIconClass = $selectedIcon.attr('class').replace(' text-white', '').trim(); // Get icon class, remove text-white utility
            setDefaultSortIcon(selectedIconClass);

            // Find the text of the selected option
            let sort = $(this).find('.font-weight-bold').text();
            switch (sort) {
                case 'Name A - Z': arrangeitems('filename', 'asc'); break
                case 'Name Z - A': arrangeitems('filename', 'desc'); break
                case 'Date Newest First': arrangeitems('date', 'desc'); break
                default: arrangeitems('date', 'asc'); break
            }
        });

        var data = null;
        var fuse = null;
        let searchHandler = function() {
            let searchTerm = '';
            if ($(this).is('input')) {
                searchTerm = $(this).val();
            } else { // It's the button click
                searchTerm = $(this).closest('.input-group').find('.folder-search-input').val();
            }

            if (fuse === null) {
                    // Initialize Fuse with the data and options
                    // This creates the index the first time.
                    let scanSuccessHandler = (path, scannedData) => {
                        data = scannedData;
                        fuse = new Fuse(data, FUSE_OPTIONS);
                        window.hideLoading()
                        performSearch(fuse, data, searchTerm)
                    }
                    window.requestScanFolder(currentPath, scanSuccessHandler)

                    return
            }

            performSearch(fuse, data, searchTerm)
        }

        // Attach event listener for typing in the search input fields
        $('.folder-search-input').on('input', searchHandler);

        // Attach event listener for clicking the search buttons
        // Select buttons within the input group append divs
        $('.input-group-append .btn').on('click', searchHandler);

        // Also handle form submission (e.g., pressing Enter in the input)
        $('form.navbar-search').on('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            searchHandler.call($(this).find('.folder-search-input'));
        });

        window.hideSidebar()
        window.hideLoading()
    }

})(jQuery); // End of use strict
