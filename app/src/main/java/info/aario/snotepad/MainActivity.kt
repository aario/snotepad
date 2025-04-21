package info.aario.snotepad

// Imports remain largely the same, ensure necessary ones are present
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
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
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Date
import android.os.Build
import android.content.pm.ApplicationInfo
import androidx.activity.OnBackPressedCallback

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var webViewBackCallback: OnBackPressedCallback

    // Keep ActivityResultLauncher in MainActivity as it's tied to the Activity lifecycle
    // Made public so WebAppInterface can access it via the activity instance
    val openDirectoryLauncher: ActivityResultLauncher<Intent> = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.also { uri ->
                val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or
                        Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                try {
                    contentResolver.takePersistableUriPermission(uri, takeFlags)
                    Log.d("MainActivity", "Folder selected: $uri")
                    val escapedUri = escapeStringForJavaScript(uri.toString())
                    callJs("requestFolderSelectionSuccess('$escapedUri')")
                } catch (e: SecurityException) {
                     Log.e("MainActivity", "Failed to take persistable URI permission", e)
                     toastError("Failed to get persistent permission for the selected folder.")
                }
            }
        } else {
            Log.w("MainActivity", "Folder selection cancelled or failed.")
            toastError("Folder selection cancelled or failed.")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) {
                WebView.setWebContentsDebuggingEnabled(true)
            }
        }

        setContentView(webView)

        // --- Modern Back Press Handling ---
        val onBackPressedCallback = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // This callback is always enabled, so this code will always execute
                // when the back button is pressed while this Activity is active.

                // Check if webView is initialized before calling methods on it,
                // just as a safety measure, though based on your description it should be.
                if (! ::webView.isInitialized) {
                    return;
                }

                callJs("handleBackPress()")
            }
        }

        // Add the callback to the dispatcher, linking it to the Activity's lifecycle
        onBackPressedDispatcher.addCallback(this, onBackPressedCallback)
        // --- End Modern Back Press Handling ---
    }

    // --- callJs remains in MainActivity (helper for this activity) ---
    // Made public so WebAppInterface can call it via the activity instance
    fun callJs(script: String) {
        if (::webView.isInitialized) {
             webView.post {
                webView.evaluateJavascript("javascript:window.$script", null)
             }
        } else {
            Log.w("MainActivity", "WebView not initialized when trying to evaluate JS: $script")
        }
    }

    fun toastError(message: String) {
        callJs("showToast('$message', true)");
    }
}
