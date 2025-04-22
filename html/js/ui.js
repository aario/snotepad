(function($) {
    "use strict"; // Start of use strict
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
                window.lunchFolderView(lastPath)
            }

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
        window.settingsUpdateFolders(paths)
    }





  window.getStoredTheme = () => localStorage.getItem('theme')
  window.setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = window.getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }
    // Default to 'auto' if nothing is stored and system preference isn't dark.
    // Or default to 'light' if you prefer.
    // If system default is dark, 'auto' would resolve to 'dark' anyway in setTheme.
    return 'auto'
  }

  window.setTheme = theme => {
    if (theme === 'auto') {
      // Check system preference and apply dark/light accordingly
      document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  // --- Apply the theme and update UI on initial load ---
  const initialTheme = getPreferredTheme();
  window.setTheme(initialTheme);
  // Store 'auto' explicitly if it was the initial derived preference but not stored
  if (!getStoredTheme() && initialTheme === 'auto') {
       window.setStoredTheme('auto')
  }

  // --- Listen for system theme changes AFTER initial load ---
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = window.getStoredTheme()
    // Only react to system changes if the user explicitly selected 'auto' or hasn't made a choice yet
    if (storedTheme === 'auto' || !storedTheme) {
      // Re-evaluate preferred theme (which checks system preference if theme is 'auto')
      const newPreferred = getPreferredTheme();
      window.setTheme(newPreferred);
      // No UI update needed here for radio buttons, as the 'auto' radio should remain checked.
      // If 'auto' wasn't stored and system changed, getPreferredTheme would return 'light'/'dark'
      // but we likely still want 'auto' selected conceptually unless the user explicitly picks light/dark.
    }
  })
})(jQuery); // End of use strict
