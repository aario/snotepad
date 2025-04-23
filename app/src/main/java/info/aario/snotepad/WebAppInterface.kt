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
import android.provider.DocumentsContract
import android.content.ContentResolver

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
        val escapedUri = escapeStringForJavaScript(directoryUri.toString())
        val functionName = "${if (scan) "scan" else "read"}FolderCallback"
        activity.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val filesList = mutableListOf<JSONObject>()
                val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                val contentResolver = activity.contentResolver
                // --- Step 1: Get the Document ID for the tree URI ---
                val treeDocumentId = DocumentsContract.getTreeDocumentId(directoryUri)
                // --- Step 2: Build the URI for querying children ---
                val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(directoryUri, treeDocumentId)

                // Log the children URI for debugging
                Log.d("WebAppInterface", "Querying children URI: $childrenUri")

                val projection = arrayOf(
                    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                    DocumentsContract.Document.COLUMN_LAST_MODIFIED,
                    DocumentsContract.Document.COLUMN_MIME_TYPE,
                    DocumentsContract.Document.COLUMN_DOCUMENT_ID // Still need this to build individual file URIs later
                )

                // Optional: You might want to remove the selection here and filter in Kotlin,
                // as filtering within the query might not be universally supported by all providers.
                // val selection = "${DocumentsContract.Document.COLUMN_MIME_TYPE} LIKE 'text/%'"
                // val selectionArgs: Array<String>? = null
                val selection: String? = null // Query all children first
                val selectionArgs: Array<String>? = null

                contentResolver.query(
                    childrenUri,
                    projection,
                    null, // selection ; Null because filtering within the query might not be universally supported by all providers.
                    null, // selectionArgs
                    null // sortOrder ; Null because sorting happens in the web application itself
                )?.use { cursor ->
                    while (cursor.moveToNext()) {
                        val filename = cursor.getString(cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_DISPLAY_NAME))
                        val lastModifiedMillis = cursor.getLong(cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_LAST_MODIFIED))
                        val mimeType = cursor.getString(cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_MIME_TYPE))
                        val documentId = cursor.getString(cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_DOCUMENT_ID))

                        if (mimeType == null || !mimeType.startsWith("text/", ignoreCase = true)) {
                            continue
                        }

                        // Double-check if it's a file (some providers might return directories in the query)
                        // You might need to construct a child URI and check its Document.COLUMN_FLAGS
                        // or rely on the MIME type.

                        val formattedDate = if (lastModifiedMillis > 0) {
                            isoFormat.format(Date(lastModifiedMillis))
                        } else {
                            "Unknown Date"
                        }

                        filesList.add(JSONObject().apply {
                            put("date", formattedDate)
                            put("filename", filename)
                            if (scan && mimeType?.startsWith("text/", ignoreCase = true) == true) {
                                // Read content only if scan is true and it's a text file
                                var fileContent = "Error reading content"
                                val fileUri = DocumentsContract.buildDocumentUriUsingTree(directoryUri, documentId)
                                try {
                                    contentResolver.openInputStream(fileUri)?.use { inputStream ->
                                        java.io.BufferedReader(java.io.InputStreamReader(inputStream)).use { reader ->
                                            fileContent = reader.readText()
                                        }
                                    }
                                } catch (e: Exception) {
                                    Log.e("WebAppInterface", "Error reading file content for $filename", e)
                                    fileContent = "Error reading content: ${e.message}"
                                }
                                put("content", fileContent)
                            }
                        })
                    }

                    val filesJson = JSONArray(filesList).toString()
                    val escapedJson = escapeStringForJavaScript(filesJson)
                    withContext(Dispatchers.Main) { // withContext is to ensure JavaScript callbacks are executed on the main thread.
                        activity.callJs("$functionName('$escapedUri', '$escapedJson')")
                    }
                } ?: run {
                    withContext(Dispatchers.Main) {
                        activity.callJs("$functionName('$escapedUri', 'Error querying directory content.', true)")
                    }
                }

            } catch (e: Exception) {
                Log.e("WebAppInterface", "Error listing files", e)
                withContext(Dispatchers.Main) {
                    activity.callJs("$functionName('$escapedUri', 'Error listing files: ${escapeStringForJavaScript(e.message ?: "Unknown error")}', true)")
                }
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
                    activity.callJs("readFileCallback('Error: Could not access the specified folder.', true)")
                    return@launch // Exit the coroutine
                }

                // 3. Find the specific file within the directory
                val file = documentsTree.findFile(filename)

                // Check if the file exists and is a regular file
                if (file == null || !file.isFile) {
                    Log.e("WebAppInterface", "File '$filename' not found or is not a file in directory: $uriString")
                    activity.callJs("readFileCallback('Error: File '$filename' not found.', true)")
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
                        activity.callJs("readFileCallback('Error: Could not open file for reading.', true)")
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
                        activity.callJs("readFileCallback('$escapedUri', '$escapedFileContent')")
                    }
                    // --- /IMPORTANT ---
                } catch (e: Exception) { // Catch potential IOExceptions during read
                    Log.e("WebAppInterface", "Error reading file content from ${file.uri}", e)
                    activity.callJs("readFileCallback('Error reading file: ${e.localizedMessage}', true)")
                }

            } catch (e: IllegalArgumentException) {
                Log.e("WebAppInterface", "Invalid URI string provided: $uriString", e)
                activity.callJs("readFileCallback('Error: Invalid folder path provided.', true)")
            } catch (e: SecurityException) {
                 Log.e("WebAppInterface", "Permission denied for URI: $uriString", e)
                 activity.callJs("readFileCallback('Error: Permission denied to access folder.', true)")
            } catch (e: Exception) { // Catch other unexpected errors
                Log.e("WebAppInterface", "An unexpected error occurred during initiateReadFile", e)
                activity.callJs("readFileCallback('An unexpected error occurred.', true)")
            }
        }
    }

    @JavascriptInterface
    fun initiateWriteFile(uriString: String, content: String) {
        Log.d("WebAppInterface", "saveFile called: $uriString")
        val directoryUriString = dirname(uriString)
        val currentDirectoryUri = Uri.parse(directoryUriString)
        var filename = basename(uriString)
        val safeFilename = filename.replace(Regex("[^a-zA-Z0-9._\\s()-]"), "_")
        val fileUri = Uri.parse("$directoryUriString/$safeFilename")
        val escapedSafeFilename = escapeStringForJavaScript(safeFilename)
        val escapedUri = escapeStringForJavaScript(uriString)
        activity.lifecycleScope.launch(Dispatchers.IO) { // Launch coroutine on IO dispatcher
            try {
                val directory = DocumentFile.fromTreeUri(activity, currentDirectoryUri)
                if (directory == null || !directory.isDirectory || !directory.canWrite()) {
                     withContext(Dispatchers.Main) {
                        activity.callJs("writeFileCallback('Error: Cannot write to the selected directory. Please select another folder.', true)")
                     }
                    return@launch
                }
                val existingFile = directory.findFile(safeFilename)
                if (existingFile != null) {
                    Log.d("WebAppInterface", "File '$safeFilename' exists, deleting for overwrite.")
                    if (!existingFile.delete()) {
                         withContext(Dispatchers.Main) {
                            activity.callJs("writeFileCallback('Error: Could not delete existing file $escapedSafeFilename for overwrite.', true)")
                         }
                        return@launch
                    }
                }
                val newFile = directory.createFile("text/plain", safeFilename)
                if (newFile == null) {
                     withContext(Dispatchers.Main) {
                        activity.callJs("writeFileCallback('javascript:showError('Error: Could not create file $escapedSafeFilename in the selected directory.', true)")
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
                    val escapedNewUri = escapeStringForJavaScript("$directoryUriString/${newFile.name}")
                    activity.callJs("writeFileCallback('$escapedUri', '$escapedNewUri')")
                }
            } catch (e: Exception) {
                Log.e("WebAppInterface", "Error saving file to path: $uriString", e)
                // Switch back to the Main thread for error UI updates
                withContext(Dispatchers.Main) {
                    activity.callJs("writeFileCallback('Error saving file: ${escapeStringForJavaScript(e.message ?: "Unknown error")}', true)")
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

    @JavascriptInterface
    fun releaseFolder(uriString: String) {
        Log.d("WebAppInterface", "NOT IMPLEMENTED YET: releaseFolder: $uriString")
    }

    fun dirname(uriString: String): String {
        return uriString.substringBeforeLast('/', missingDelimiterValue = "")
    }

    fun basename(uriString: String): String {
        return uriString.split('/').last()
    }
}
