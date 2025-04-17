# app/proguard-rules.pro
# ProGuard rules for the app module.

# Add project specific ProGuard rules here.
# By default, the flags in this file are applied to implementations of the
# library specified in build.gradle. For example, the following line
# applies code shrinking on the exported library:
#-dontshrink

# If your project uses WebView with JavaScript, uncomment the following
# and adjust the class name accordingly:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}
# Keep the JavascriptInterface methods
-keepclassmembers class info.aario.snotepad.WebAppInterface {
   @android.webkit.JavascriptInterface <methods>;
}

# Keep Kotlin metadata for reflection (if needed, often required by libraries)
-keep class kotlin.Metadata { *; }
-keep class kotlin.coroutines.Continuation { *; } # Keep Continuation for coroutines

# Add any rules specific to libraries you use. For example, if you use Gson:
# -keep class com.google.gson.annotations.** { *; }
# -keep class * implements com.google.gson.TypeAdapterFactory
# -keep class * implements com.google.gson.JsonSerializer
# -keep class * implements com.google.gson.JsonDeserializer

# Keep default constructors for Activities, Services, etc.
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference
-keep public class com.android.vending.licensing.ILicensingService

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep R class members
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Suppress warnings about kotlinx libraries (common issue)
-dontwarn kotlinx.**


