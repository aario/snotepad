package info.aario.snotepad

// Imports remain largely the same, ensure necessary ones are present
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.provider.DocumentsContract
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher // Import explicitly if needed
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.documentfile.provider.DocumentFile
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val PREFS_NAME = "SNotePadPrefs"
    private val PREF_KEY_LAST_URI = "last_selected_uri"
    var selectedDirectoryUri: Uri? = null // Made internal or public if WebAppInterface needs direct access (or use getter) - keeping default (public) for simplicity

    // Keep ActivityResultLauncher in MainActivity as it's tied to the Activity lifecycle
    // Made public so WebAppInterface can access it via the activity instance
    val openDirectoryLauncher: ActivityResultLauncher<Intent> = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.also { uri ->
                val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or
                        Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                try {
                    contentResolver.takePersistableUriPermission(uri, takeFlags)
                    Log.d("MainActivity", "Folder selected: $uri")
                    selectedDirectoryUri = uri
                    with(prefs.edit()) {
                        putString(PREF_KEY_LAST_URI, uri.toString())
                        apply()
                        Log.d("MainActivity", "Saved URI to SharedPreferences: $uri")
                    }
                    listFilesFromUri(uri)
                } catch (e: SecurityException) {
                     Log.e("MainActivity", "Failed to take persistable URI permission", e)
                     selectedDirectoryUri = null
                     with(prefs.edit()) {
                         remove(PREF_KEY_LAST_URI)
                         apply()
                     }
                     evaluateJavascript("javascript:showError('Failed to get persistent permission for the selected folder.')")
                }
            }
        } else {
            Log.w("MainActivity", "Folder selection cancelled or failed.")
            evaluateJavascript("javascript:showError('Folder selection cancelled or failed.')")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        loadAndUseLastUri()

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()

            // Instantiate the external WebAppInterface, passing this MainActivity instance
            addJavascriptInterface(WebAppInterface(this@MainActivity), "AndroidInterface")

            loadUrl("file:///android_asset/index.html")
        }
        setContentView(webView)
    }

    // --- loadAndUseLastUri remains in MainActivity ---
    private fun loadAndUseLastUri() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedUriString = prefs.getString(PREF_KEY_LAST_URI, null)
        if (savedUriString != null) {
            Log.d("MainActivity", "Found saved URI: $savedUriString")
            val savedUri = Uri.parse(savedUriString)
            val hasPermission = contentResolver.persistedUriPermissions.any {
                it.uri == savedUri && it.isReadPermission && it.isWritePermission
            }
            if (hasPermission) {
                Log.d("MainActivity", "Permissions still valid for saved URI.")
                selectedDirectoryUri = savedUri
                listFilesFromUri(savedUri)
            } else {
                Log.w("MainActivity", "Permissions lost for saved URI: $savedUriString. Clearing.")
                with(prefs.edit()) {
                    remove(PREF_KEY_LAST_URI)
                    apply()
                }
                selectedDirectoryUri = null
            }
        } else {
             Log.d("MainActivity", "No saved URI found.")
             selectedDirectoryUri = null
        }
    }

    // --- evaluateJavascript remains in MainActivity (helper for this activity) ---
    // Made public so WebAppInterface can call it via the activity instance
    fun evaluateJavascript(script: String) {
        if (::webView.isInitialized) {
             webView.post {
                webView.evaluateJavascript(script, null)
             }
        } else {
            Log.w("MainActivity", "WebView not initialized when trying to evaluate JS: $script")
        }
    }

    // --- listFilesFromUri remains in MainActivity (uses lifecycleScope, calls evaluateJavascript) ---
    // Made public so WebAppInterface can call it via the activity instance (e.g., after save)
    fun listFilesFromUri(directoryUri: Uri) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val directory = DocumentFile.fromTreeUri(this@MainActivity, directoryUri)
                if (directory != null && directory.isDirectory && directory.canRead()) {
                    val filesList = mutableListOf<JSONObject>()
                    directory.listFiles().forEach { file ->
                        if (file.isFile) {
                            filesList.add(JSONObject().apply {
                                put("name", file.name ?: "Unknown Name")
                                put("uri", file.uri.toString())
                            })
                        }
                    }
                    val filesJson = JSONArray(filesList).toString()
                    Log.d("MainActivity", "Files found: $filesJson")
                    // Use escapeStringForJavaScript from Utils.kt (ensure import)
                    val escapedJson = escapeStringForJavaScript(filesJson)
                    withContext(Dispatchers.Main) {
                        evaluateJavascript("javascript:displayFileList('$escapedJson')")
                    }
                } else {
                     withContext(Dispatchers.Main) {
                        evaluateJavascript("javascript:showError('Selected item is not a directory or cannot be read.')")
                    }
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error listing files", e)
                 withContext(Dispatchers.Main) {
                     // Use escapeStringForJavaScript from Utils.kt (ensure import)
                     evaluateJavascript("javascript:showError('Error listing files: ${escapeStringForJavaScript(e.message ?: "Unknown error")}')")
                 }
            }
        }
    }

    // --- WebAppInterface inner class is REMOVED ---

    // --- escapeStringForJavaScript function is REMOVED (moved to Utils.kt) ---

    // --- onBackPressed remains in MainActivity ---
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) { // Added check for initialization
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
