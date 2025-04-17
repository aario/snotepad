(function($) {
  "use strict"; // Start of use strict

  var $editorElement = $('#markdown-editor');
  // Check if EasyMDE is defined (it might be loaded asynchronously or conditionally)
  if (typeof EasyMDE !== 'undefined') {
     if ($editorElement.length > 0) {
       const easyMDE = new EasyMDE({
         element: $editorElement[0]
       });
       console.log('EasyMDE Initialized Successfully!');
     } else {
       // Only log error if the *element* is missing, not if EasyMDE library is missing
       console.error('Error: Textarea element with ID "markdown-editor" not found.');
     }
   } else {
     // Optional: Log if EasyMDE library itself isn't loaded when the script runs
     // Be cautious if EasyMDE is loaded later; this might log unnecessarily.
     // console.warn('EasyMDE library not found when easymde-init.js executed.');
     if ($editorElement.length > 0) {
        console.warn('EasyMDE library not found, cannot initialize editor for #markdown-editor.');
     }
   }

})(jQuery); // End of use strict
