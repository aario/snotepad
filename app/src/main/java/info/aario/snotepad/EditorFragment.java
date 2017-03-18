package info.aario.snotepad;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

/**
 * Created by aario on 3/16/17.
 */

public class EditorFragment extends Fragment {
    private MainActivity activity;
    private String path;
    private EditText etEditor;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        activity = (MainActivity) getActivity();
        View view = inflater.inflate(R.layout.editor_fragment, container, false);
        FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
        fab.setImageDrawable(ContextCompat.getDrawable(activity, android.R.drawable.ic_menu_save));
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                activity.filer.writeToFile(path,etEditor.getText().toString());
            }
        });
        etEditor = (EditText) view.findViewById(R.id.etEditor);
        if (activity.filer.exists(path)) {
            String text = activity.filer.getStringFromFile(path);
            activity.toast(text);
            etEditor.setText(text);
        } else
            etEditor.getText().clear();
        return view;
    }

    public void open(String filePath) {
        path = filePath;
    }
}
