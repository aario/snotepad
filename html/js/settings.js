(function($) {
    // Define the function that should be called for settings
    function lunchSettings() {
        console.log("lunchSettings function called!");
        // Add the actual logic for launching settings here
        // For example, you might show a modal, load content via AJAX, etc.
        alert("Settings panel would be launched here.");
    }
    window.lunchSettings = lunchSettings;
})(jQuery); // End of use strict
