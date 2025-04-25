(function($) {
    "use strict"; // Start of use strict
    const sidebar = $("#accordionSidebar")

    // Toggle the side navigation
    $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
        $("body").toggleClass("sidebar-toggled");
        sidebar.toggleClass("toggled");
        if (sidebar.hasClass("toggled")) {
            $('.sidebar .collapse').collapse('hide');
        };
    });

    // Close any open menu accordions when window is resized below 768px
    $(window).resize(function() {
        if ($(window).width() < 768) {
            $('.sidebar .collapse').collapse('hide');
        };

        // Toggle the side navigation when window is resized below 480px
        if ($(window).width() < 480 && !sidebar.hasClass("toggled")) {
            $("body").addClass("sidebar-toggled");
            sidebar.addClass("toggled");
            $('.sidebar .collapse').collapse('hide');
        };
    });

    // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
    $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
        if ($(window).width() > 768) {
            var e0 = e.originalEvent,
                delta = e0.wheelDelta || -e0.detail;
            this.scrollTop += (delta < 0 ? 1 : -1) * 30;
            e.preventDefault();
        }
    });

    window.sidebarUpdateFolders = (paths) => {
        sidebar.find(".sidebar-folder").remove();
        const $div = $("#sidebarFoldersBegin");

        // Insert the new HTML content provided in the 'template' variable
        // immediately after the button.
        let $lastElement = $div
        $.each(paths, (i, path) => {
            let active = ''
            let editorCurrentPath = window.getEditorCurrentPath()
            if (editorCurrentPath !== null) {
                if (path === window.dirname(editorCurrentPath)) {
                    active = 'active'
                }
            } else {
                let folderViewCurrentPath = window.getFolderViewCurrentPath()
                if (folderViewCurrentPath !== null && path === folderViewCurrentPath) {
                    active = 'active'
                }
            }

            const $newItem = $(
                window.renderTemplate(
                    {
                        'basename': window.getHumanReadableBasename(path),
                        'path': path,
                        'id': i,
                        'active': active
                    },
                    'sidebar-folder'
                )
            )

            $lastElement.after(
                $newItem
            )
            $lastElement = $newItem
        })
    }

    window.sidebarHighlightItem = ($item) => {
        // Find the parent li.nav-item of the clicked link
        let $parentLi = $item.closest('li.nav-item')

        // Find all li.nav-item elements within the same parent container 
        //    (e.g., all direct children of the surrounding UL/OL)
        //    and remove the 'active' class from all of them.
        //    This ensures only one item is active at a time within this group.
        sidebar.children('li.nav-item').removeClass('active')

        // Add the 'active' class specifically to the parent li of the clicked link.
        $parentLi.addClass('active')
    }

    $(document).on('click', ".sidebar .nav-link", function(event) {
        // Prevent the default link behavior (e.g., navigating to '#')
        event.preventDefault();
        window.sidebarHighlightItem($(this))
    })
    $(document).on('click', '.sidebar-folder', function(event) {
        // Prevent the default link behavior (e.g., navigating to '#')
        event.preventDefault();

        // 'this' refers to the specific '.sidebar-folder' link that was clicked.
        let $clickedLink = $(this);


        // Get the value from the 'data-id' attribute of the clicked link
        let folderId = $clickedLink.data('id'); // e.g., "123"

        // Construct the specific ID for the hidden div using the retrieved folderId
        // This creates a selector like "#sidebar-folder-item-path-123"
        let pathDivSelector = '#sidebar-folder-item-path-' + folderId;

        // Find the specific hidden div using its ID, searching only *within*
        // the clicked link's descendants for efficiency and context.
        let $pathDiv = $clickedLink.find(pathDivSelector);

        let pathValue = $pathDiv.text();

        // Display the path in an alert dialog
        window.lunchFolderView(pathValue)
    });

    window.hideSidebar = () => {
        const $button = $("#sidebarToggleTop");
        var isSmallScreen = $button.is(':visible');
        
        // Check if the sidebar is currently shown (does not have 'toggled' class)
        var isSidebarVisible = !$('#accordionSidebar').hasClass('toggled');

        // If it's a small screen AND the sidebar is visible
        if (isSmallScreen && isSidebarVisible) {
            // Trigger a click on the button to hide the sidebar
            $button.trigger('click');
        }
    }

    $('.sidebar-item-simple-page').on('click', function() {
        var pageId = $(this).attr('id');
        lunchPage(pageId);
    });
})(jQuery); // End of use strict
