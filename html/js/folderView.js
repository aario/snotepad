(function($) {
    "use strict"; // Start of use strict
    var currentPath = ''
    var folderContent = []

    // Function to set the initial/default icon for the sort dropdown toggle
    function setDefaultSortIcon(iconClass) {
        $('#sortDropdown i').removeClass().addClass(iconClass + ' fa-fw'); // Remove existing classes, add new ones
    }

    function arrangeitems(sort, order) {
        const $itemsDiv = $("#items");
        $itemsDiv.empty()
        $.each(window.sortArray(folderContent, sort, order), (i, file) => {
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

        window.writePreferences('sort', sort)
        window.writePreferences('order', order)
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

    window.folderViewReadFolderSuccess = (path, folderContentJson) => {
        folderContent = JSON.parse(folderContentJson)

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

        window.hideLoading()
    }

})(jQuery); // End of use strict
