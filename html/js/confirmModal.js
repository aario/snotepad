(function($) {
    "use strict"; // Start of use strict
    // Get the modal instance
    const confirmModal = new bootstrap.Modal($('#confirmModal'));

    window.confirmModal = (
        title,
        message,
        confirmCallback,
        cancelCallback
    ) => {
        $('#confirmModalLabel').text(title)
        $('#confirmModalMessage').html(message)

        // Handle the click on the final confirmation button inside the modal
        $('#confirmBtn').off('click').on('click', () => {
            // Hide the modal
            confirmModal.hide()

            confirmCallback()
        });

        // Handle the click on the final confirmation button inside the modal
        let cancelButton = $('#cancelBtn');
        cancelButton.off('click');
        if (cancelCallback) {
            cancelButton.on('click', cancelCallback);
        }
 
        // Show the modal
        confirmModal.show();
    }
})(jQuery); // End of use strict
