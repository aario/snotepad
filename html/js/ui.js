(function($) {
    "use strict"; // Start of use strict
    // --- Preference Keys ---
    const THEME_STORAGE_KEY = 'app-theme';
    const MODE_STORAGE_KEY = 'ui-mode'; // Assuming this is what getStoredTheme/setStoredTheme used

    function setNavBar(templateName, data) {
        // Select the button with the ID 'sidebarToggleTop' using jQuery
        const $button = $("#btnBack");

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


        const lastPath = window.readPreferences('lastPath')
        if (lastPath !== undefined && lastPath !== null) {
            window.sidebarHighlightItem($('.sidebar .nav-link div:contains("' + lastPath + '")'))
            window.lunchFolderView(lastPath)
        }
        $('#btn-welcome-add-folder').on('click', function() {
            window.requestFolderSelection()
        })

        window.hideLoading()
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
        if (window.getCurrentAction() === window.lunchSettings) {
            window.settingsUpdateFolders(paths)
        }
    }

    // --- Getters for Preferences ---
    window.getStoredTheme = () => {
        let theme = localStorage.getItem(THEME_STORAGE_KEY)
        if (!theme) {
            theme = 'default' // Default to 'default' theme
        }

        return theme
    }

    window.getStoredMode = () => {
        let mode = localStorage.getItem(MODE_STORAGE_KEY)
        if (!mode) {
            mode = 'auto' // Default to 'auto' mode
        }

        return mode
    }

    // --- Setters for Preferences ---
    window.setStoredTheme = (theme) => localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.setStoredMode = (mode) => localStorage.setItem(MODE_STORAGE_KEY, mode);

    // --- Get Preferred Mode (Handles 'auto') ---
    const getPreferredMode = () => {
        const storedMode = getStoredMode();
        if (storedMode && storedMode !== 'auto') {
            return storedMode;
        }
        // Check system preference if 'auto' or not set
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // --- Apply Theme and Mode to DOM ---
    window.applyAppearance = (theme, mode) => {
        const effectiveMode = (mode === 'auto') ? getPreferredMode() : mode;
        console.log(`Applying Theme: ${theme}, Mode: ${mode}, Effective Mode: ${effectiveMode}`);

        // Set theme attribute on body (or html)
        document.documentElement.setAttribute('data-app-theme', theme);

        // Set Bootstrap's theme attribute on html (recommended by Bootstrap)
        document.documentElement.setAttribute('data-bs-theme', effectiveMode);

        // Optional: Add theme-specific class to body if needed for non-variable styles
        // document.body.classList.remove('theme-default', 'theme-oceanic', 'theme-forest', 'theme-sunset');
        // document.body.classList.add(`theme-${theme}`);
    };

    // --- Initialize Appearance ---
    const initialTheme = window.getStoredTheme(); // Default to 'default' theme
    const initialMode = window.getStoredMode();   // Default to 'auto' mode
    window.applyAppearance(initialTheme, initialMode);

    // Add listener for system color scheme changes if mode is 'auto'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentSelectedMode = getStoredMode() || 'auto';
        if (currentSelectedMode === 'auto') {
            const currentTheme = getStoredTheme() || 'default';
            window.applyAppearance(currentTheme, 'auto'); // Re-apply to update effective mode
            // If settings page is visible, update the UI radios (optional)
            if(document.getElementById('page')?.dataset?.pageName === 'settings') { // Example check
                updateAppearanceUI(currentTheme, 'auto');
            }
        }
    });
})(jQuery); // End of use strict
