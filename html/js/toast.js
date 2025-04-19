$(document).ready(function() {
  "use strict"; // Start of use strict

  // Function to show an error toast
  window.showToast = (message, isError) => {
    // Generate a unique ID for the new toast
    const uniqueId = 'toast-' + Date.now()

    // Append the cloned toast to the container
    $('#toastContainer').append(
        window.renderTemplate(
            {
                'id': uniqueId,
                'message': message,
                'title': isError ? 'Error' : 'Info',
                'bg': isError ? 'danger' : 'info',
                'role': isError ? 'alert' : 'info',
            },
            'toast'
        )
    )

    // Get the native DOM element for Bootstrap and Hammer.js
    const toastElement = $('#' + uniqueId)[0]
    debugger;

    // Initialize Bootstrap Toast
    const bsToast = new bootstrap.Toast(toastElement, {
      // autohide: false, // Already set in HTML, but can be set here too
      // delay: 5000 // Optional: if you want autohide after a delay
    });

    // --- Hammer.js Swipe Integration ---
    const hammer = new Hammer(toastElement);

    // Enable horizontal swiping
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    // Listen for swipeleft or swiperight
    hammer.on('swipeleft swiperight', function(ev) {
      bsToast.hide(); // Hide the toast on swipe
    });
    // --- End Hammer.js Integration ---

    // Show the toast
    bsToast.show();

    // Optional: Remove the toast from DOM after it's hidden to prevent buildup
    toastElement.addEventListener('hidden.bs.toast', function () {
      hammer.destroy(); // Clean up Hammer instance
    });
  }
});
