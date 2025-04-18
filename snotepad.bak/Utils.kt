package info.aario.snotepad

/**
 * Contains utility functions for the SNotePad application.
 */

/**
 * Escapes characters in a string to make it safe for insertion
 * into JavaScript single-quoted or double-quoted strings.
 * Handles null input by returning an empty string.
 *
 * @param str The string to escape.
 * @return The escaped string, or an empty string if input is null.
 */
fun escapeStringForJavaScript(str: String?): String {
    if (str == null) return ""
    // Order matters: escape backslash first
    return str.replace("\\", "\\\\")
              .replace("'", "\\'")
              .replace("\"", "\\\"") // Escape double quotes
              .replace("\n", "\\n") // Escape newlines
              .replace("\r", "\\r") // Escape carriage returns
              .replace("\t", "\\t") // Escape tabs
              // Add other escapes if necessary (e.g., \b, \f)
}
