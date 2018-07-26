package info.aario.snotepad;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.preference.Preference;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;

import com.nononsenseapps.filepicker.FilePickerActivity;

import java.io.File;

/**
 * Created by aario on 3/16/17.
 */

public class SettingsFragment extends PreferenceFragment {
    private AppCompatActivity activity;
//    private Button btChangePath;
//    private TextView tvPath;
    private SharedPreferences preferences;
    private static final int FILE_CODE = 1;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        activity = (AppCompatActivity) getActivity();
        Toolbar toolbar = (Toolbar) activity.findViewById(R.id.toolbar);
        activity.setSupportActionBar(toolbar);

        // Load the preferences from an XML resource
        addPreferencesFromResource(R.xml.preferences);

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getContext());
        Preference savePathPref = (Preference) findPreference("PATH");

        savePathPref.setOnPreferenceClickListener(new Preference.OnPreferenceClickListener() {
            @Override
            public boolean onPreferenceClick(Preference preference){
                // This always works
                Intent i = new Intent(activity, FilePickerActivity.class);
                // This works if you defined the intent filter
                // Intent i = new Intent(Intent.ACTION_GET_CONTENT);

                // Set these depending on your use case. These are the defaults.
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, false);
                i.putExtra(FilePickerActivity.EXTRA_ALLOW_CREATE_DIR, true);
                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_DIR);

                // Configure initial directory by specifying a String.
                // You could specify a String like "/storage/emulated/0/", but that can
                // dangerous. Always use Android's API calls to get paths to the SD-card or
                // internal memory.
                SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getContext());
                i.putExtra(FilePickerActivity.EXTRA_START_PATH, preferences.getString("PATH", activity.getString(R.string.default_shared_path)));

                startActivityForResult(i, FILE_CODE);

                return true;
            }
        });

        Preference saveLocation = (Preference) findPreference("saveLocation");

        saveLocation.setOnPreferenceClickListener(new Preference.OnPreferenceClickListener() {
            @Override
            public boolean onPreferenceClick(Preference preference){


                return true;
            }
        });

        Preference pref = findPreference("PATH");
        pref.setSummary(preferences.getString("PATH", activity.getString(R.string.default_shared_path)));

    }

//    @Override
//    public View onCreateView(LayoutInflater inflater, ViewGroup container,
//                             Bundle savedInstanceState) {
//        setHasOptionsMenu(true);
//        activity = (MainActivity) getActivity();
//        View view = inflater.inflate(R.layout.settings_fragment, container, false);
//        tvPath = (TextView) view.findViewById(R.id.tvPath);
//        tvPath.setText(activity.getPath());
//        btChangePath = (Button) view.findViewById(R.id.btChangePath);
//        btChangePath.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                // This always works
//                Intent i = new Intent(activity, FilePickerActivity.class);
//                // This works if you defined the intent filter
//                // Intent i = new Intent(Intent.ACTION_GET_CONTENT);
//
//                // Set these depending on your use case. These are the defaults.
//                i.putExtra(FilePickerActivity.EXTRA_ALLOW_MULTIPLE, false);
//                i.putExtra(FilePickerActivity.EXTRA_ALLOW_CREATE_DIR, true);
//                i.putExtra(FilePickerActivity.EXTRA_MODE, FilePickerActivity.MODE_DIR);
//
//                // Configure initial directory by specifying a String.
//                // You could specify a String like "/storage/emulated/0/", but that can
//                // dangerous. Always use Android's API calls to get paths to the SD-card or
//                // internal memory.
//                i.putExtra(FilePickerActivity.EXTRA_START_PATH, activity.getPath());
//
//                startActivityForResult(i, FILE_CODE);
//            }
//        });
//        FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
//        fab.setImageDrawable(ContextCompat.getDrawable(activity, android.R.drawable.ic_menu_save));
//        fab.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                activity.setPath(tvPath.getText().toString());
//                getFragmentManager().popBackStack();
//            }
//        });
//
//        return view;
//    }

    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode == FILE_CODE && resultCode == Activity.RESULT_OK) {
            // The URI will now be something like content://PACKAGE-NAME/root/path/to/file
            Uri uri = intent.getData();
            // A utility method is provided to transform the URI to a File object
            File file = com.nononsenseapps.filepicker.Utils.getFileForUri(uri);
            // If you want a URI which matches the old return value, you can do
            Uri fileUri = Uri.fromFile(file);

            SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getContext());
            SharedPreferences.Editor editor = preferences.edit();
            editor.putString("PATH", fileUri.getPath());
            editor.commit();

            Preference pref = findPreference("PATH");
            pref.setSummary(preferences.getString("PATH", activity.getString(R.string.default_shared_path)));
        }
    }


    @Override
    public void onPause() {
        super.onPause();
        AppCompatActivity rootActivity = (AppCompatActivity) getActivity();
//        Toolbar toolbar = (Toolbar) rootActivity.findViewById(R.id.toolbar);
//        rootActivity.getSupportActionBar().hide();
//        rootActivity.setSupportActionBar(toolbar);
//        rootActivity.getSupportActionBar().show();
    }
}
