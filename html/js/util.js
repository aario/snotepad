(function($) {
    "use strict"; // Start of use strict
    window.basename = (path) => {
        // Split by either forward slash / or backslash \
        return path.split('/').pop();
    }

    window.dirname = (path) => {
        let lastSeparatorIndex = path.lastIndexOf('/');

        if (lastSeparatorIndex === -1) {
            // No '/' found. Standard dirname is '.' (current directory)
            return '.';
        } else if (lastSeparatorIndex === 0) {
            // Path starts with '/', e.g., "/file.txt" or just "/"
            // The directory is the root "/"
            return '/';
        } else {
            // Found '/' somewhere other than the start.
            // Return the substring from the beginning up to the last '/'
            // Handles "/path/to/file" -> "/path/to"
            // Also handles "/path/to/" -> "/path/to" (removes trailing slash implicitly)
            return path.substring(0, lastSeparatorIndex);
        }
    }

    window.getHumanReadableFolderName = (path) => {
        return window.basename(
            decodeURIComponent(
                window.basename(path)
            ).replaceAll(':', ' : ')
        )
    }
})(jQuery); // End of use strict
