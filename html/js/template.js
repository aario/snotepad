(function($) {
function renderTemplate(data, templateName) {
  templateString = window.templates[templateName]
  // Ensure data is actually an array and not empty
  if (!$.isPlainObject(data)) {
    console.warn("renderTemplate: data is invalid.");
    return ''; // Return empty string if no data
  }

  // Ensure templateString is a string
  if (typeof templateString !== 'string') {
    console.error("renderTemplate: templateString must be a string.");
    return ''; // Return empty string if template is invalid
  }

  // Iterate over each object in the data
  $.each(data, (key, value) => {
       templateString = templateString.replaceAll('{' + key + '}', value)
  });

  // Return the complete generated HTML string
  return templateString;
}
window.renderTemplate = renderTemplate
})(jQuery); // End of use strict
