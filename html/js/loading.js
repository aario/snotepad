(function($) {
    "use strict"; // Start of use strict
    window.showLoading = (prompt) => {
        const $loadingOverlay = $('#loading-overlay');
        $('#loading-prompt').text(prompt)
        $loadingOverlay.removeClass('hidden');
    }

    window.hideLoading = (prompt) => {
        $('#loading-overlay').addClass('hidden');
    }
})(jQuery); // End of use strict
