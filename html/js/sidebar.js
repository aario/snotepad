(function($) {
    "use strict"; // Start of use strict

    const sidebarFolderContainer = $('#accordionSidebar'); // The main UL element
    const sortableItemsSelector = '.nav-item.sidebar-folder'; // Selector for the items to sort

    // --- Function to save the current order ---
    // This function remains separate as it's called by the sortable 'stop' event
    function saveFolderOrder() {
        const paths = [];
        // Find the folder items *within the container* in their current order
        sidebarFolderContainer.find(sortableItemsSelector).each(function() {
            // Find the anchor tag inside the list item
            const $link = $(this).find('a.sidebar-folder');
            const folderId = $link.data('id');
            // Find the hidden path div associated with this link
            // Note: The hidden div is *inside* the <a> tag in your original HTML structure
            const pathDivSelector = '#sidebar-folder-item-path-' + folderId;
            const path = $link.find(pathDivSelector).text(); // Find within the link

            paths.push(path);
        });

        window.writePreferences('paths', JSON.stringify(paths));
        console.log('Saved folder order paths:', paths); // For debugging
    }

    function initializeSortable() {
        // Check if sortable is already initialized and destroy it first
        // This prevents issues if sidebarUpdateFolders is called multiple times
        if (sidebarFolderContainer.hasClass('ui-sortable')) {
            try {
                sidebarFolderContainer.sortable('destroy');
                console.log('Destroyed existing sortable instance.'); // Debugging
            } catch (e) {
                console.error('Error destroying sortable:', e);
            }
        }

        // Initialize Sortable *after* items are potentially destroyed/re-added
        sidebarFolderContainer.sortable({
            items: sortableItemsSelector,
            axis: 'y',
            handle: 'a.sidebar-folder',
            cursor: 'move',
            opacity: 0.7,
            placeholder: 'sidebar-folder-placeholder',
            cancel: "span, i, .d-none", // Keep this from previous step if you added it
            distance: 1, // Explicitly set default distance
            delay: 0,    // Explicitly set default delay
            start: function(event, ui) {
                // *** This should now fire ***
                console.log('Started dragging folder item...');
                ui.item.addClass('dragging'); // Add class for visual feedback
                // Ensure placeholder has the nav-item class for proper spacing/styling
                ui.placeholder.addClass('nav-item sidebar-folder-placeholder');
                // Set placeholder height dynamically
                ui.placeholder.height(ui.item.outerHeight());
            },
            stop: function(event, ui) {
                // *** This should now fire ***
                console.log('Stopped dragging folder item...');
                ui.item.removeClass('dragging'); // Remove visual feedback class
                // Save the new order
                saveFolderOrder();
            }
        });
        console.log('Sortable initialized on #accordionSidebar.'); // Debugging
    }


    // Toggle the side navigation
    $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
            $('.sidebar .collapse').collapse('hide');
        };
    });

    // Close any open menu accordions when window is resized below 768px
    $(window).resize(function() {
        if ($(window).width() < 768) {
            $('.sidebar .collapse').collapse('hide');
        };

        // Toggle the side navigation when window is resized below 480px
        if ($(window).width() < 480 && !$(".sidebar").hasClass("toggled")) {
            $("body").addClass("sidebar-toggled");
            $(".sidebar").addClass("toggled");
            $('.sidebar .collapse').collapse('hide');
        };
    });
/*
    // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
    $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
        if ($(window).width() > 768) {
            var e0 = e.originalEvent,
                delta = e0.wheelDelta || -e0.detail;
            this.scrollTop += (delta < 0 ? 1 : -1) * 30;
            e.preventDefault();
        }
    });*/

    // --- Function to Update Sidebar Folders (Called from Android/elsewhere) ---
    window.sidebarUpdateFolders = (paths) => {
        console.log("sidebarUpdateFolders called with paths:", paths); // Debugging
        const $div = $("#sidebarFoldersBegin");

        // Clear existing folder items first
        $div.nextAll(sortableItemsSelector).remove(); // Remove only the sortable items

        // Insert the new HTML content provided in the 'paths' array
        let $lastElement = $div;
        $.each(paths, (i, path) => {
            // Determine if the current path should be marked active
            let active = '';
            let editorCurrentPath = window.getEditorCurrentPath ? window.getEditorCurrentPath() : null;
            let folderViewCurrentPath = window.getFolderViewCurrentPath ? window.getFolderViewCurrentPath() : null;
            let currentDir = editorCurrentPath ? window.dirname(editorCurrentPath) : folderViewCurrentPath;

            if (currentDir !== null && path === currentDir) {
                active = 'active';
            }

            // Make sure necessary functions exist before calling them
            const folderName = window.getHumanReadableBasename ? window.getHumanReadableBasename(path) : path.split('/').pop();

            // Render the template for the folder item
            // Ensure 'window.renderTemplate' exists and works as expected
            const folderHtml = window.renderTemplate ? window.renderTemplate(
                {
                    'basename': folderName,
                    'path': path,
                    'id': i, // Use index 'i' as the data-id for simplicity here
                    'active': active
                },
                'sidebar-folder' // Template name
            ) : ''; // Provide fallback or handle error if renderTemplate is missing

            if (folderHtml) {
                 const $newItem = $(folderHtml);
                 $lastElement.after($newItem);
                 $lastElement = $newItem;
            } else {
                console.error("Could not render template for path:", path);
            }
        });

        // --- Initialize Sortable *AFTER* items are added ---
        initializeSortable();
    };

    sidebarFolderContainer.on('mousedown', 'a.sidebar-folder', function(evt) {
        console.log('Test: Mousedown detected on a.sidebar-folder handle.');
    });
    // --- Click Handler for Folder Items ---
    // Use event delegation on the container for dynamically added items
    sidebarFolderContainer.on('click', 'a.sidebar-folder', function(event) {
        // Prevent default link behavior only if it wasn't a drag operation
        // jQuery UI sortable adds 'ui-sortable-helper' while dragging
        if (!$(this).closest(sortableItemsSelector).hasClass('ui-sortable-helper')) {
             event.preventDefault();

             let $clickedLink = $(this);
             let folderId = $clickedLink.data('id');
             let pathDivSelector = '#sidebar-folder-item-path-' + folderId;
             let pathValue = $clickedLink.find(pathDivSelector).text();

             console.log("Folder clicked:", pathValue); // Debugging

             // Update active state
             // Remove 'active' from all .nav-item siblings, then add it to the clicked one's parent li
             $clickedLink.closest(sortableItemsSelector) // Find the parent li.nav-item
                 .siblings(sortableItemsSelector).removeClass('active') // Remove from siblings
                 .end() // Go back to the clicked li.nav-item
                 .addClass('active'); // Add class to the clicked one

             // Also remove active from non-folder items like 'Settings' if needed
             $clickedLink.closest(sortableItemsSelector).siblings('.nav-item:not(.sidebar-folder)').removeClass('active');


             // Call your function to handle the folder click
             if (window.lunchFolderView) {
                 window.lunchFolderView(pathValue);
             } else {
                 console.warn("window.lunchFolderView function not found.");
             }
        }
        // If it *was* part of a drag (ui-sortable-helper is present),
        // the default action (following href="#") is usually harmless
        // and already prevented by sortable itself.
    });

    // --- Function to Hide Sidebar on Small Screens ---
    window.hideSidebar = () => {
        const $button = $("#sidebarToggleTop");
        var isSmallScreen = $button.is(':visible');
        var isSidebarVisible = !$('#accordionSidebar').hasClass('toggled');

        if (isSmallScreen && isSidebarVisible) {
            $button.trigger('click');
        }
    };


})(jQuery); // End of use strict
