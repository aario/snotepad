package info.aario.snotepad;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.SearchView;
import android.widget.Toast;
import android.content.SharedPreferences;
import android.content.Context;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {
    private SharedPreferences sharedPref;
    private String path;
    private final String extension = ".txt";
    ListView lvFiles;
    SearchView svSearch;

    ArrayList<String> filePathList = new ArrayList<String>();
    ;
    Map<String, String> contentsCache = new HashMap<String, String>();

    private void writeToFile(String filename, String data) {
        try {
            File root = new File(path);
            File gpxfile = new File(root, filename);
            FileWriter writer = new FileWriter(gpxfile);
            writer.append(data);
            writer.flush();
            writer.close();
        } catch (IOException e) {
            toast("File write failed: " + e.toString());
        }
    }

    private void toast(String text) {
        Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT).show();
    }

    private String convertStreamToString(InputStream is) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line = null;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        reader.close();
        return sb.toString();
    }

    private String getStringFromFile(String filePath) {
        File fl = new File(filePath);

        String ret = "";
        try {
            FileInputStream fin = new FileInputStream(fl);
            ret = convertStreamToString(fin);
            //Make sure you close all streams.
            fin.close();
        } catch (IOException e) {
            toast("File read failed: " + e.toString());
        } finally {
            return ret;
        }
    }

    private String readFile(String filename) {
        if (!contentsCache.containsKey(filename)) {
            String filepath = path + "/" + filename;
            contentsCache.put(filename, getStringFromFile(filepath));
        }
        return contentsCache.get(filename);
    }

    private Boolean searchFile(String filename, String text) {
        return filename.contains(text) || readFile(filename).contains(text);
    }

    private void searchFiles(String text) {
        File directory = new File(path);
        File[] files = directory.listFiles();
        filePathList.clear();
        for (int i = 0; i < files.length; i++)
            if (text.isEmpty() || searchFile(files[i].getName(), text))
                filePathList.add(files[i].getName());
        populateFilesList();
    }

    private void populateFilesList() {
        ArrayAdapter<String> arrayAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, filePathList);
        lvFiles.setAdapter(arrayAdapter);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        lvFiles = (ListView) findViewById(R.id.filesList);
        lvFiles.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> arg0, View arg1, int arg2, long arg3) {
                toast(String.valueOf(arg2));
            }
        });
        svSearch = (SearchView) findViewById(R.id.searchView);
        svSearch.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                searchFiles(query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                searchFiles(newText);
                return true;
            }
        });

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

        sharedPref = this.getPreferences(Context.MODE_PRIVATE);
        path = sharedPref.getString("PATH", getExternalFilesDir(null).getAbsolutePath());
        searchFiles("");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_refresh) {
            contentsCache.clear();
            svSearch.setQuery("", true);
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
