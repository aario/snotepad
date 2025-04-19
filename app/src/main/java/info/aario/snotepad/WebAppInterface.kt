package info.aario.snotepad

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.util.Log
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.documentfile.provider.DocumentFile
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.io.File
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Provides methods accessible from JavaScript running within the WebView.
 * Acts as a bridge between the WebView's JavaScript environment and the Android application logic.
 *
 * @property activity The MainActivity instance, providing access to context, lifecycle, etc.
 */
class WebAppInterface(private val activity: MainActivity) {
    @JavascriptInterface
    fun initiateFolderSelection() {
        Log.d("WebAppInterface", "initiateFolderSelection called")
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply { }
        try {
             // Access the launcher via the activity instance
             activity.openDirectoryLauncher.launch(intent)
        } catch (e: Exception) {
             Log.e("WebAppInterface", "Could not launch folder picker", e)
             // Use activity's evaluateJavascript helper
             activity.toastError("Could not open folder picker: ${escapeStringForJavaScript(e.message ?: "Unknown error")}")
        }
    }

    // Made public so WebAppInterface can call it via the activity instance (e.g., after save)
    @JavascriptInterface
    fun initiateReadFolder(directoryUriString: String, scan: Boolean) {
        val directoryUri = Uri.parse(directoryUriString)
        activity.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val directory = DocumentFile.fromTreeUri(activity, directoryUri)
                if (directory != null && directory.isDirectory && directory.canRead()) {
                    val filesList = mutableListOf<JSONObject>()
                    val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US) // Use Locale.US for consistency

                    directory.listFiles().forEach { file ->
                        if (file.isFile) {
                            val lastModifiedMillis = file.lastModified()
                            val formattedDate = if (lastModifiedMillis > 0) {
                                // Convert milliseconds to Date and format
                                isoFormat.format(Date(lastModifiedMillis))
                            } else {
                                "Unknown Date" // Handle cases where timestamp is 0 or unavailable
                            }
                            filesList.add(JSONObject().apply {
                                put("date", formattedDate)
                                put("filename",  file.name)

                                // Read and add file content only if scan is true
                                if (scan) {
                                    var fileContent = "Error reading content" // Default error message
                                    try {
                                        // Use contentResolver for SAF URIs
                                        activity.contentResolver.openInputStream(file.uri)?.use { inputStream ->
                                            BufferedReader(InputStreamReader(inputStream)).use { reader ->
                                                // Read the entire file content. Be cautious with large files.
                                                // Consider limiting the size or reading line by line if necessary.
                                                fileContent = reader.readText()
                                            }
                                        }
                                    } catch (e: Exception) {
                                        Log.e("WebAppInterface", "Error reading file content for ${file.name}", e)
                                        // Keep the default error message or customize
                                        fileContent = "Error reading content: ${e.message}"
                                    }
                                    put("content", fileContent) // Add content to JSON
                                }
                            })
                        }
                    }
                    val filesJson = JSONArray(filesList).toString()
                    // Use escapeStringForJavaScript from Utils.kt (ensure import)
                    val escapedJson = escapeStringForJavaScript(filesJson)
                    val escapedUri = escapeStringForJavaScript(directoryUri.toString())
                    var functionName = "${if (scan) "scan" else "read"}FolderSuccess"
                    withContext(Dispatchers.Main) {
                        activity.evaluateJavascript("javascript:window.$functionName('$escapedUri', '$escapedJson')")
                    }
                } else {
                    activity.toastError("Selected item is not a directory or cannot be read.")
                }
            } catch (e: Exception) {
                Log.e("WebAppInterface", "Error listing files", e)
                activity.toastError("Error listing files: ${escapeStringForJavaScript(e.message ?: "Unknown error")}")
            }
        }
    }

    @JavascriptInterface
    fun initiateReleaseFolderPermission(uriToReleaseString: String) {
        val uriToRelease = Uri.parse(uriToReleaseString)
        try {
            // Specify the exact flags you want to release.
            // If you took both read and write, you might need to call release twice,
            // or release the specific one you no longer need.
            // Here we assume you want to release the read permission.
            val releaseFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION;

            activity.contentResolver.releasePersistableUriPermission(uriToRelease, releaseFlags);
            System.out.println("Released READ permission for URI: " + uriToRelease);

            val releaseWriteFlags: Int = Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
            activity.contentResolver.releasePersistableUriPermission(uriToRelease, releaseWriteFlags);
            System.out.println("Released WRITE permission for URI: " + uriToRelease);
        } catch (e: SecurityException) {
            System.err.println("Failed to release permission for URI: $uriToRelease - ${e.message}");
            activity.toastError("Failed to get persistent permission for the selected folder.")
        }
    }

    @JavascriptInterface
    fun initiateReadFile(uriString: String) {
        var filename = basename(uriString)
        // Perform file operations off the main thread
        activity.lifecycleScope.launch(Dispatchers.IO) {
            try {
                // 1. Parse the directory URI string
                val directoryUri = Uri.parse(uriString)

                // 2. Get a DocumentFile representing the directory
                // Requires context (from activity) and the directory URI
                val documentsTree = DocumentFile.fromTreeUri(activity, directoryUri)

                // Check if the directory URI is valid and accessible
                if (documentsTree == null || !documentsTree.isDirectory) {
                    Log.e("WebAppInterface", "Failed to access directory from URI: $uriString")
                    activity.toastError("Error: Could not access the specified folder.")
                    return@launch // Exit the coroutine
                }

                // 3. Find the specific file within the directory
                val file = documentsTree.findFile(filename)

                // Check if the file exists and is a regular file
                if (file == null || !file.isFile) {
                    Log.e("WebAppInterface", "File '$filename' not found or is not a file in directory: $uriString")
                    activity.toastError("Error: File '$filename' not found.")
                    return@launch // Exit the coroutine
                }

                Log.d("WebAppInterface", "Found file: ${file.uri}")

                // 4. Read the file content using ContentResolver
                val stringBuilder = StringBuilder()
                try {
                    activity.contentResolver.openInputStream(file.uri)?.use { inputStream ->
                        BufferedReader(InputStreamReader(inputStream)).use { reader ->
                            var line: String?
                            while (reader.readLine().also { line = it } != null) {
                                stringBuilder.append(line).append("\n") // Append line and newline
                            }
                        }
                    } ?: run {
                        // Handle case where openInputStream returns null (should be rare if file exists)
                        Log.e("WebAppInterface", "Could not open input stream for file: ${file.uri}")
                        activity.toastError("Error: Could not open file for reading.")
                        return@launch
                    }

                    val fileContent = stringBuilder.toString()
                    Log.d("WebAppInterface", "Successfully read file content (length: ${fileContent.length})")

                    // --- IMPORTANT ---
                    // 5. TODO: Do something with the fileContent
                    //    For example, pass it back to your WebView's JavaScript.
                    //    This needs to be done on the main thread if interacting with UI/WebView.
                    withContext(Dispatchers.Main) {
                        // Example: Call a JavaScript function named 'handleFileContent'
                        // activity.webView.evaluateJavascript("javascript:handleFileContent(`${fileContent.replace("`", "\\`")}`);", null)
                        Log.i("WebAppInterface", "File read complete. Content needs to be sent to JS.")
                        val escapedFileContent = escapeStringForJavaScript(fileContent)
                        val escapedUri = escapeStringForJavaScript(directoryUri.toString())
                        activity.evaluateJavascript("javascript:window.readFileSuccess('$escapedUri', '$escapedFileContent')")
                    }
                    // --- /IMPORTANT ---
                } catch (e: Exception) { // Catch potential IOExceptions during read
                    Log.e("WebAppInterface", "Error reading file content from ${file.uri}", e)
                    activity.toastError("Error reading file: ${e.localizedMessage}")
                }

            } catch (e: IllegalArgumentException) {
                Log.e("WebAppInterface", "Invalid URI string provided: $uriString", e)
                activity.toastError("Error: Invalid folder path provided.")
            } catch (e: SecurityException) {
                 Log.e("WebAppInterface", "Permission denied for URI: $uriString", e)
                 activity.toastError("Error: Permission denied to access folder.")
            } catch (e: Exception) { // Catch other unexpected errors
                Log.e("WebAppInterface", "An unexpected error occurred during initiateReadFile", e)
                activity.toastError("An unexpected error occurred.")
            }
        }
    }

    @JavascriptInterface
    fun initiateWriteFile(uriString: String, content: String) {
        Log.d("WebAppInterface", "saveFile called: $uriString")
        val directoryUriString = dirname(uriString)
        val currentDirectoryUri = Uri.parse(directoryUriString)
        var filename = basename(uriString)
        val safeFilename = filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")
        var filenameEncoded = Uri.encode(safeFilename)
        val fileUri = Uri.parse("$directoryUriString/$filenameEncoded")
        val escapedSafeFilename = escapeStringForJavaScript(safeFilename)
        val escapedUri = escapeStringForJavaScript(uriString)
        activity.lifecycleScope.launch(Dispatchers.IO) { // Launch coroutine on IO dispatcher
            try {
                val directory = DocumentFile.fromTreeUri(activity, currentDirectoryUri)
                if (directory == null || !directory.isDirectory || !directory.canWrite()) {
                     withContext(Dispatchers.Main) {
                        activity.toastError("Error: Cannot write to the selected directory. Please select another folder.")
                     }
                    return@launch
                }
                val existingFile = directory.findFile(filenameEncoded)
                if (existingFile != null) {
                    Log.d("WebAppInterface", "File '$safeFilename' exists, deleting for overwrite.")
                    if (!existingFile.delete()) {
                         withContext(Dispatchers.Main) {
                            activity.toastError("Error: Could not delete existing file $escapedSafeFilename for overwrite.")
                         }
                        return@launch
                    }
                }
                val newFile = directory.createFile("text/plain", filenameEncoded)
                if (newFile == null) {
                     withContext(Dispatchers.Main) {
                        activity.toastError("javascript:showError('Error: Could not create file $escapedSafeFilename in the selected directory.")
                     }
                    return@launch
                }
                // Use activity's contentResolver
                activity.contentResolver.openOutputStream(newFile.uri)?.use { outputStream ->
                    OutputStreamWriter(outputStream).use { writer ->
                        writer.write(content)
                    }
                } ?: throw Exception("Could not open output stream for new file: ${newFile.uri}")

                Log.d("WebAppInterface", "File '$safeFilename' saved successfully in selected directory.")
                withContext(Dispatchers.Main) {
                    activity.evaluateJavascript("javascript:window.writeFileSuccess('$escapedUri')")
                }
            } catch (e: Exception) {
                Log.e("WebAppInterface", "Error saving file to path: $uriString", e)
                // Switch back to the Main thread for error UI updates
                withContext(Dispatchers.Main) {
                    activity.toastError("Error saving file: ${escapeStringForJavaScript(e.message ?: "Unknown error")}")
                }
            }
        }
    }

    @JavascriptInterface
    fun deleteFile(uriString: String) {
        val directoryUriString = uriString.substringBeforeLast('/', missingDelimiterValue = "")
        var filename = uriString.split('/').last()
        val currentDirectoryUri = Uri.parse(directoryUriString)
        activity.lifecycleScope.launch(Dispatchers.IO) { // Launch coroutine on IO dispatcher
            try {
                val directory = DocumentFile.fromTreeUri(activity, currentDirectoryUri)
                if (directory == null || !directory.isDirectory || !directory.canWrite()) {
                     withContext(Dispatchers.Main) {
                        activity.toastError("Error: Cannot write to the selected directory. Please select another folder.")
                     }
                    return@launch
                }
                val existingFile = directory.findFile(filename)
                if (existingFile != null) {
                    Log.d("WebAppInterface", "File '$filename' exists, deleting for overwrite.")
                    if (!existingFile.delete()) {
                         withContext(Dispatchers.Main) {
                            activity.toastError("Error: Could not find the file $filename for removal.")
                         }
                        return@launch
                    }
                }
            } catch (e: Exception) {
                Log.e("WebAppInterface", "Error saving file to path: $uriString", e)
                // Switch back to the Main thread for error UI updates
                withContext(Dispatchers.Main) {
                    activity.toastError("Error saving file: ${escapeStringForJavaScript(e.message ?: "Unknown error")}")
                }
            }
        }
    }

    fun dirname(uriString: String): String {
        return uriString.substringBeforeLast('/', missingDelimiterValue = "")
    }

    fun basename(uriString: String): String {
        return uriString.split('/').last()
    }
}
