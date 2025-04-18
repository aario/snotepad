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

/**
 * Provides methods accessible from JavaScript running within the WebView.
 * Acts as a bridge between the WebView's JavaScript environment and the Android application logic.
 *
 * @property activity The MainActivity instance, providing access to context, lifecycle, etc.
 */
class WebAppInterface(private val activity: MainActivity) {

    private val PREFS_NAME = "SNotePadPrefs" // Consider moving constants elsewhere if needed

    @JavascriptInterface
    fun showToast(message: String) {
        // Use the activity context and run on UI thread
        activity.runOnUiThread {
             Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun requestFolderSelection() {
         Log.d("WebAppInterface", "requestFolderSelection called")
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply { }
        try {
             // Access the launcher via the activity instance
             activity.openDirectoryLauncher.launch(intent)
        } catch (e: Exception) {
             Log.e("WebAppInterface", "Could not launch folder picker", e)
             // Use activity's evaluateJavascript helper
             activity.evaluateJavascript("javascript:showError('Could not open folder picker: ${escapeStringForJavaScript(e.message ?: "Unknown error")}')")
        }
    }

    @JavascriptInterface
    fun readFileContent(uriString: String) {
         Log.d("WebAppInterface", "readFileContent called for: $uriString")
         val fileUri = Uri.parse(uriString)
         // Use activity's lifecycleScope
         activity.lifecycleScope.launch(Dispatchers.IO) {
             try {
                 // Use activity's contentResolver
                 activity.contentResolver.openInputStream(fileUri)?.use { inputStream ->
                     BufferedReader(InputStreamReader(inputStream)).use { reader ->
                         val content = reader.readText()
                         Log.d("WebAppInterface", "Read content successfully")
                         withContext(Dispatchers.Main) {
                             val escapedContent = escapeStringForJavaScript(content)
                             val escapedUri = escapeStringForJavaScript(uriString)
                             activity.evaluateJavascript("javascript:displayFileContent('$escapedUri', '$escapedContent')")
                         }
                     }
                 } ?: throw Exception("Could not open input stream for URI: $uriString")
             } catch (e: Exception) {
                 Log.e("WebAppInterface", "Error reading file content for URI: $uriString", e)
                 withContext(Dispatchers.Main) {
                     val escapedUri = escapeStringForJavaScript(uriString)
                     activity.evaluateJavascript("javascript:showError('Error reading file $escapedUri: ${escapeStringForJavaScript(e.message ?: "Unknown error")}')")
                 }
             }
         }
    }

    @JavascriptInterface
    fun saveFile(filename: String, content: String) {
        Log.d("WebAppInterface", "saveFile called: $filename")
        // Access selectedDirectoryUri via the activity instance
        val currentDirectoryUri = activity.selectedDirectoryUri
        if (currentDirectoryUri == null) {
            activity.evaluateJavascript("javascript:showError('Error: No folder selected. Please select a folder first.')")
            return
        }
        if (filename.isBlank()) {
            activity.evaluateJavascript("javascript:showError('Filename cannot be empty.')")
            return
        }
        val safeFilename = filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")

        activity.lifecycleScope.launch(Dispatchers.IO) {
            try {
                // Use activity context for DocumentFile
                val directory = DocumentFile.fromTreeUri(activity, currentDirectoryUri)
                if (directory == null || !directory.isDirectory || !directory.canWrite()) {
                     withContext(Dispatchers.Main) {
                        activity.evaluateJavascript("javascript:showError('Error: Cannot write to the selected directory. Please select another folder.')")
                     }
                    return@launch
                }
                val existingFile = directory.findFile(safeFilename)
                if (existingFile != null) {
                    Log.d("WebAppInterface", "File '$safeFilename' exists, deleting for overwrite.")
                    if (!existingFile.delete()) {
                         withContext(Dispatchers.Main) {
                            activity.evaluateJavascript("javascript:showError('Error: Could not delete existing file $safeFilename for overwrite.')")
                         }
                        return@launch
                    }
                }
                val newFile = directory.createFile("text/plain", safeFilename)
                if (newFile == null) {
                     withContext(Dispatchers.Main) {
                        activity.evaluateJavascript("javascript:showError('Error: Could not create file $safeFilename in the selected directory.')")
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
                    showToast("File '$safeFilename' saved in selected folder.") // Can call own showToast
                    activity.evaluateJavascript("javascript:clearSaveFields()")
                    // Refresh list after saving - call activity's method
                    activity.listFilesFromUri(currentDirectoryUri)
                }
            } catch (e: Exception) {
                Log.e("WebAppInterface", "Error saving file to selected directory", e)
                withContext(Dispatchers.Main) {
                     activity.evaluateJavascript("javascript:showError('Error saving file $safeFilename: ${escapeStringForJavaScript(e.message ?: "Unknown error")}')")
                }
            }
        }
    }


    @JavascriptInterface
    fun saveToPreferences(key: String, value: String) {
         Log.d("WebAppInterface", "saveToPreferences called: Key=$key")
         if (key.isBlank()) {
             activity.evaluateJavascript("javascript:showError('Preference key cannot be empty.')")
             return
         }
         activity.lifecycleScope.launch(Dispatchers.IO) {
             try {
                 // Use activity context to get SharedPreferences
                 val prefs: SharedPreferences = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                 with(prefs.edit()) {
                     putString(key, value)
                     apply()
                 }
                 Log.d("WebAppInterface", "Preference saved: Key=$key")
                 withContext(Dispatchers.Main) {
                     showToast("Preference '$key' saved.") // Can call own showToast
                 }
             } catch (e: Exception) {
                 Log.e("WebAppInterface", "Error saving preference", e)
                  withContext(Dispatchers.Main) {
                     activity.evaluateJavascript("javascript:showError('Error saving preference $key: ${escapeStringForJavaScript(e.message ?: "Unknown error")}')")
                 }
             }
         }
    }

    @JavascriptInterface
    fun loadFromPreferences(key: String) {
        Log.d("WebAppInterface", "loadFromPreferences called: Key=$key")
        if (key.isBlank()) {
             activity.evaluateJavascript("javascript:showError('Preference key cannot be empty.')")
            return
        }
        activity.lifecycleScope.launch(Dispatchers.IO) {
             try {
                // Use activity context to get SharedPreferences
                val prefs: SharedPreferences = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val value = prefs.getString(key, null)
                withContext(Dispatchers.Main) {
                    if (value != null) {
                        Log.d("WebAppInterface", "Preference loaded: Key=$key, Value=$value")
                        val escapedValue = escapeStringForJavaScript(value)
                        activity.evaluateJavascript("javascript:displayPreferenceValue('$escapedValue')")
                    } else {
                        Log.w("WebAppInterface", "Preference not found for key: $key")
                        activity.evaluateJavascript("javascript:showError('No value found for key: $key')")
                        activity.evaluateJavascript("javascript:displayPreferenceValue('')")
                    }
                }
             } catch (e: Exception) {
                 Log.e("WebAppInterface", "Error loading preference", e)
                  withContext(Dispatchers.Main) {
                     activity.evaluateJavascript("javascript:showError('Error loading preference $key: ${escapeStringForJavaScript(e.message ?: "Unknown error")}')")
                 }
             }
         }
    }
}
