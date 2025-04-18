(function($) {
    "use strict"; // Start of use strict
        function setNavBar(templateName, data) {
            // Select the button with the ID 'sidebarToggleTop' using jQuery
            const $button = $("#sidebarToggleTop");

            // Find all sibling elements that come *after* the button
            // and remove them from the DOM.
            $button.nextAll().remove();

            // Insert the new HTML content provided in the 'template' variable
            // immediately after the button.
            $button.after(
                window.renderTemplate(
                    data,
                    templateName
                )
            );
        }

        window.setNavBar = setNavBar

        function setPage(templateName, data) {
            const $page = $('#page')
            $page.empty()
            $page.html(
                window.renderTemplate(
                    data,
                    templateName
                )
            );
        }
        window.setPage = setPage

        function navigate(elementId) {
            console.log("Navigate called with ID:", elementId); // For debugging

            const prefix = 'sidebar-item-';

            // Check if the ID starts with the expected prefix
            if (elementId && elementId.startsWith(prefix)) {
                // Extract the part after "sidebar-item-"
                const key = elementId.substring(prefix.length);
                console.log("Extracted key:", key); // For debugging

                // Check if the extracted part is 'settings'
                if (key === 'settings') {
                    window.lunchSettings(); // Call the specific function for settings
                } else {
                    console.log("Key is not 'settings'."); // For debugging
                    // You could add logic here for other keys if needed in the future
                }
            } else {
                console.log("ID does not start with 'sidebar-item-' or is null."); // For debugging
            }
        }

        // Wait for the DOM to be fully loaded before running jQuery code
        $(document).ready(function() {
            // Select the settings link by its ID and attach a click event handler
            $('#sidebar-item-settings').on('click', function(event) {
                // Prevent the default link behavior (e.g., following the '#' href)
                event.preventDefault();

                // Get the ID of the element that was clicked ('sidebar-item-settings')
                const clickedElementId = this.id;

                // Call the navigate function, passing the ID
                navigate(clickedElementId);
            });

            window.sidebarUpdateFolders(
                JSON.parse(
                    window.readPreferences('paths')
                )
            )
        });

    // Scroll to top button appear
    $(document).on('scroll', function() {
        var scrollDistance = $(this).scrollTop();
        if (scrollDistance > 100) {
            $('.scroll-to-top').fadeIn();
        } else {
            $('.scroll-to-top').fadeOut();
        }
    });

    // Smooth scrolling using jQuery easing
    $(document).on('click', 'a.scroll-to-top', function(e) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top)
        }, 1000, 'easeInOutExpo');
        e.preventDefault();
    });

    window.uiUpdateFolders = (paths) => {
        window.sidebarUpdateFolders(paths)
        window.settingsUpdateFolders(paths)
    }
    document.documentElement.setAttribute('data-bs-theme', 'dark')
})(jQuery); // End of use strict
