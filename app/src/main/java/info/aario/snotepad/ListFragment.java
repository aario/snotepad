package info.aario.snotepad;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.view.ContextMenu;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.SearchView;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by aario on 3/16/17.
 */

public class ListFragment extends Fragment {
    private MainActivity activity;
    private String path;
    private final String extension = ".txt";
    ListView lvFiles;
    SearchView svSearch;
    ArrayList<String> filePathList = new ArrayList<String>();

    Map<String, String> contentsCache = new HashMap<String, String>();

    private String readFile(String filename) {
        if (!contentsCache.containsKey(filename)) {
            String filepath = path + "/" + filename;
            contentsCache.put(filename, activity.filer.getStringFromFile(filepath));
        }
        return contentsCache.get(filename);
    }

    private Boolean searchFile(String filename, String text) {
        return filename.contains(text) || readFile(filename).contains(text);
    }

    private ArrayList<String> searchFiles(String text) {
        File directory = new File(path);
        File[] files = directory.listFiles();
        ArrayList<String> filePathList = new ArrayList<String>();
        filePathList.clear();
        for (int i = 0; i < files.length; i++)
            if (text.isEmpty() || searchFile(files[i].getName(), text))
                filePathList.add(files[i].getName());
        return filePathList;
    }

    private void populateFilesList() {
        ArrayAdapter<String> arrayAdapter = new ArrayAdapter<String>(activity, android.R.layout.simple_list_item_1, filePathList);
        lvFiles.setAdapter(arrayAdapter);
    }

    private void search(String text) {
        filePathList = searchFiles(text);
        populateFilesList();
    }

    public void refresh() {
        contentsCache.clear();
        svSearch.setQuery("", true);
    }

    public String proposeNewFilePath(String prefix) {
        int i = 0;
        String result;
        do {
            result = path + "/" + prefix + (++i > 1 ? " " + String.valueOf(i) : "") + extension;
        } while (activity.filer.exists(result));
        return result;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        activity = (MainActivity) getActivity();
        View view = inflater.inflate(R.layout.list_fragment, container, false);
        // Inflate the layout for this fragment
        lvFiles = (ListView) view.findViewById(R.id.filesList);
        lvFiles.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> arg0, View arg1, int arg2, long arg3) {
                activity.editFile(path + "/" + filePathList.get(arg2));
            }
        });
        registerForContextMenu(lvFiles);
        svSearch = (SearchView) view.findViewById(R.id.searchView);
        svSearch.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                search(query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                search(newText);
                return true;
            }
        });
        FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
        fab.setImageDrawable(ContextCompat.getDrawable(activity, android.R.drawable.ic_input_add));
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                activity.editFile(proposeNewFilePath("Note"));
            }
        });
        path = activity.getPath();
        search("");
        return view;
    }

    public void onCreateContextMenu(final ContextMenu menu,
                                    final View v, final ContextMenu.ContextMenuInfo menuInfo) {
        activity.getMenuInflater().inflate(R.menu.list_menu, menu);
    }

    public boolean onContextItemSelected(final MenuItem item) {
        int id = item.getItemId();
        AdapterView.AdapterContextMenuInfo itemInfo = (AdapterView.AdapterContextMenuInfo) item.getMenuInfo();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_delete) {
            String filename = filePathList.get(itemInfo.position);
            if (activity.filer.delete(path + "/" + filename)) {
                search(svSearch.getQuery().toString());
                activity.makeSnackBar("File " + filename + " successfully deleted.");
            }
        }

        return true;
    }
}
