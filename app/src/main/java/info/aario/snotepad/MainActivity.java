package info.aario.snotepad;

import android.Manifest;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.annotation.NonNull;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import java.io.File;

public class MainActivity extends AppCompatActivity {
    private SharedPreferences sharedPref;
    private SharedPreferences.Editor sharedPrefEditor;
    private EditorFragment currentEditorFragment;
    CoordinatorLayout coordinatorLayoutForSnackBar;
    ListFragment listFragment = new ListFragment();
    public Filer filer;
    public boolean editor_modified;

    private String getDefaultPath() {
        return getExternalFilesDir(null).getAbsolutePath();
    }

    public String getPath(){
        return getPath(true);
    }

    public String getPath(boolean requestPermissions) {
        String path;

        if (sharedPref.getString("saveLocation", "internal").equals("internal")){
            path = getDefaultPath();
            Log.d("storage:", "internal");
            Log.d("path:", path);
        } else {
            path = sharedPref.getString("PATH", getString(R.string.default_shared_path));
            if (requestPermissions) requestStoragePermission();
            Log.d("storage:", "shared");
            Log.d("path:", path);
        }

        File file = new File(path);

        if (!file.exists()) {
            if (file.mkdirs()) {
                Log.d("createDir", "Successfully created the parent dir:" + file.getName());
            } else {
                Log.d("createDir", "Failed to create the parent dir:" + file.getName());
            }
        }

        if (!file.canWrite()) {
            String old_path = path;
            path = getDefaultPath();
            toast("The path " + old_path + " was not writable. Falling back to default path: " + path);
        }
        return path;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        listFragment.refresh(false);
    }

    public  boolean requestStoragePermission() {
        if (Build.VERSION.SDK_INT >= 23) {
            if (checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
                Log.v("permission","Permission is granted");
                return true;
            } else {
                Log.v("permission","Permission is revoked");
                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1);
                return false;
            }
        }
        else { //permission is automatically granted on sdk<23 upon installation
            Log.v("permission","Permission is granted");
            return true;
        }
    }

    public void setLastOpenedFilePath(String filePath) {
        sharedPrefEditor.putString("CURRENT_OPENED_FILE_PATH", filePath);
        sharedPrefEditor.commit();
    }

    public String getOpenedFilePath() {
        return sharedPref.getString("CURRENT_OPENED_FILE_PATH", "");
    }

    public void toast(String text) {
        Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT).show();
    }

    public void makeSnackBar(String text) {
        Snackbar.make(coordinatorLayoutForSnackBar, text, Snackbar.LENGTH_LONG)
                .setAction("Action", null).show();
    }

    private void changeFragment(Fragment f, boolean allowBack) {
        FragmentManager fragmentManager = getFragmentManager();

        // Prune the stack, so "back" always leads home.
        if (fragmentManager.getBackStackEntryCount() > 0) {
            onSupportNavigateUp();
        }

        FragmentTransaction transaction = fragmentManager.beginTransaction();
        transaction.replace(R.id.fragment_container, f);
        if (allowBack) {
            transaction.addToBackStack(null);
            transaction.setTransition(FragmentTransaction.TRANSIT_NONE);
        }
        transaction.commit();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        coordinatorLayoutForSnackBar = (CoordinatorLayout) findViewById(R.id.co_ordinated_layout_main);
        sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        sharedPrefEditor = sharedPref.edit();
        filer = new Filer(this);
        changeFragment(listFragment, false); //Show list of files to setLastOpenedFilePath
        String last_opened_file_path = getOpenedFilePath();
        if (filer.exists(last_opened_file_path)) {
            editFile(last_opened_file_path);
        } else {
            setLastOpenedFilePath("");//Clear last opened file path
        }
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().hide();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    public void editFile(String filePath) {
        currentEditorFragment = new EditorFragment();
        changeFragment(currentEditorFragment, true);
        setLastOpenedFilePath(filePath);
        editor_modified = false;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_sort_by_name) {
            listFragment.sort(false);
            return true;
        }

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_sort_by_date) {
            listFragment.sort(true);
            return true;
        }

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            Intent intent = new Intent(this, SettingsActivity.class);
            startActivity(intent);
            //changeFragment(new SettingsFragment(), true);
            return true;
        }

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_refresh) {
            listFragment.refresh();
            return true;
        }

        if (id == R.id.action_about) {
            Intent intent = new Intent(this, AboutActivity.class);
            startActivity(intent);
            return true;
        }

        if (id == android.R.id.home) {
            onBackPressed();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onBackPressed() {

        int count = getFragmentManager().getBackStackEntryCount();

        if (count == 0) {
            super.onBackPressed();
        } else if (editor_modified) {
            DialogInterface.OnClickListener dialogClickListener = new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    switch (which) {
                        case DialogInterface.BUTTON_POSITIVE:
                            //Yes button clicked
                            currentEditorFragment.save();
                            break;
                        case DialogInterface.BUTTON_NEGATIVE:
                            //No button clicked
                            getFragmentManager().popBackStack();
                            break;
                        case DialogInterface.BUTTON_NEUTRAL:
                            //Cancel button clicked
                            return;
                    }
                    setLastOpenedFilePath("");//Clear last opened file path
                    getFragmentManager().popBackStack();
                }
            };
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setMessage(getResources().getString(R.string.save_dialog_question))
                    .setPositiveButton(getResources().getString(R.string.yes), dialogClickListener)
                    .setNegativeButton(getResources().getString(R.string.no), dialogClickListener)
                    .setNeutralButton(getResources().getString(R.string.cancel), dialogClickListener)
                    .show();
        } else {
            setLastOpenedFilePath("");//Clear last opened file path
            getFragmentManager().popBackStack();
        }
    }

}

//TODO disable settings
//TODO fix icons
//TODO Refresh list after location change
//TODO move from internal to shared