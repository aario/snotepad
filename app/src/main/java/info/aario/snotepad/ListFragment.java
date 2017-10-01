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
import android.widget.ListView;
import android.widget.SearchView;
import android.widget.SimpleAdapter;
import android.widget.TextView;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by aario on 3/16/17.
 */

public class ListFragment extends Fragment {
    private MainActivity activity;
    private String path;
    private final String extension = ".txt";
    private boolean sortByDate = true;
    ListView lvFiles;
    SearchView svSearch;
    ArrayList<String> fileNameList = new ArrayList<String>();

    Map<String, String> contentsCache = new HashMap<String, String>();

    private String readFile(String filename) {
        if (!contentsCache.containsKey(filename)) {
            String filepath = path + "/" + filename;
            contentsCache.put(filename, activity.filer.getStringFromFile(filepath));
        }
        return contentsCache.get(filename);
    }

    private Boolean searchFile(String filename, String text) {
        String lower = text.toLowerCase();
        return filename.toLowerCase().contains(lower) || readFile(filename).toLowerCase().contains(lower);
    }

    private ArrayList<String> searchFiles(String text) {
        File directory = new File(path);
        File[] files = directory.listFiles(new FileFilter() {
            @Override
            public boolean accept(File file) {
                return file.isFile() && file.getName().endsWith(extension);
            }
        });
        ArrayList<String> filePathList = new ArrayList<String>();
        filePathList.clear();
        for (int i = 0; i < files.length; i++)
            if (text.isEmpty() || searchFile(files[i].getName(), text))
                filePathList.add(files[i].getName());
        return filePathList;
    }

    private void populateFilesList() {
        List<Map<String, String>> data = new ArrayList<Map<String, String>>();
        for (String fileName : fileNameList) {
            Map<String, String> item = new HashMap<String, String>(2);
            item.put("title", fileName);
            item.put("date", activity.filer.getModifiedTimestamp(path + "/" + fileName));
            data.add(item);
        }
        Collections.sort(data, new Comparator<Map<String, String>>() {
            @Override
            public int compare(Map<String, String> o1, Map<String, String> o2) {
                if (sortByDate)
                    try {
                        return activity.filer.dateFormat.parse(o2.get("date")).compareTo(
                                activity.filer.dateFormat.parse(o1.get("date"))
                        );
                    } catch (Exception e) {
                        return 0;
                    }

                return o2.get("title").compareTo(o1.get("title"));
            }
        });
        SimpleAdapter adapter = new SimpleAdapter(activity, data,
                android.R.layout.simple_list_item_2,
                new String[]{"title", "date"},
                new int[]{android.R.id.text1,
                        android.R.id.text2});
        lvFiles.setAdapter(adapter);
    }

    private void search(String text) {
        fileNameList = searchFiles(text);
        populateFilesList();
    }

    public void refresh() {
        path = activity.getPath();
        contentsCache.clear();
        svSearch.setQuery("", true);
    }

    public void sort(boolean byDate) {
        sortByDate = byDate;
        populateFilesList();
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
                activity.editFile(path + "/" + ((TextView) arg1.findViewById(android.R.id.text1)).getText().toString());
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
        fab.setVisibility(View.VISIBLE);
        fab.setImageDrawable(ContextCompat.getDrawable(activity, android.R.drawable.ic_input_add));
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                activity.editFile(proposeNewFilePath("Note"));
            }
        });
        refresh();
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
            String filename = ((TextView) itemInfo.targetView.findViewById(android.R.id.text1)).getText().toString();
            if (activity.filer.delete(path + "/" + filename)) {
                search(svSearch.getQuery().toString());
                activity.makeSnackBar("File " + filename + " successfully deleted.");
            }
        }

        return true;
    }
}
