(function($) {
  "use strict"; // Start of use strict

  /**
  * Sorts the array by filename in ascending order (A-Z).
  * Note: Modifies the original array in place.
  * @param {Array<Object>} arr The array to sort.
  * @returns {Array<Object>} The sorted array.
  */
  function sortByFilenameAsc(arr) {
    if (!Array.isArray(arr)) {
        console.error("Input must be an array.");
        return arr; // Return original input or handle error appropriately
    }
    arr.sort((a, b) => {
      // Use localeCompare for proper string comparison
      return a.filename.localeCompare(b.filename, undefined, { numeric: true })
    });
    return arr;
  }

  /**
  * Sorts the array by filename in descending order (Z-A).
  * Note: Modifies the original array in place.
  * @param {Array<Object>} arr The array to sort.
  * @returns {Array<Object>} The sorted array.
  */
  function sortByFilenameDesc(arr) {
    if (!Array.isArray(arr)) {
        console.error("Input must be an array.");
        return arr;
    }
    arr.sort((a, b) => {
      // Reverse the comparison for descending order
      return b.filename.localeCompare(a.filename, undefined, { numeric: true })
    });
    return arr;
  }

  /**
  * Sorts the array by date, newest first (descending).
  * Note: Modifies the original array in place.
  * @param {Array<Object>} arr The array to sort.
  * @returns {Array<Object>} The sorted array.
  */
  function sortByDateNewest(arr) {
    if (!Array.isArray(arr)) {
        console.error("Input must be an array.");
        return arr;
    }
    arr.sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // Subtracting dates gives the difference in milliseconds.
      // dateB - dateA gives descending order (newest first).
      return dateB - dateA;
    });
    return arr;
  }

  /**
  * Sorts the array by date, oldest first (ascending).
  * Note: Modifies the original array in place.
  * @param {Array<Object>} arr The array to sort.
  * @returns {Array<Object>} The sorted array.
  */
  function sortByDateOldest(arr) {
    if (!Array.isArray(arr)) {
        console.error("Input must be an array.");
        return arr;
    }
    arr.sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // dateA - dateB gives ascending order (oldest first).
      return dateA - dateB;
    });
    return arr;
  }

  window.sortArray = (array, sort, order) => {
    if (sort === 'filename') {
      if (order === 'asc') {
        return sortByFilenameAsc(array)
      }

      return sortByFilenameDesc(array)
    } else {
      if (order === 'asc') {
        return sortByDateOldest(array)
      }
      
      return sortByDateNewest(array)
    }
  }
})(jQuery); // End of use strict
