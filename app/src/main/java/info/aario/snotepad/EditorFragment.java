package info.aario.snotepad;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.text.Editable;
import android.text.TextWatcher;
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
    private String name;
    private EditText etEditor;
    private EditText etTitle;
    private boolean modified;

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
                save();
            }
        });
        etTitle = (EditText) view.findViewById(R.id.etTitle);
        name = activity.filer.getFileNameWithoutExtension(path);
        etTitle.setText(name);
        etEditor = (EditText) view.findViewById(R.id.etEditor);
        if (activity.filer.exists(path))
            etEditor.setText(activity.filer.getStringFromFile(path));
        etEditor.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                modified = true;
            }
        });
        return view;
    }

    private void save() {
        String newName = etTitle.getText().toString();
        String oldPath = path;
        boolean rename = (!newName.equals(name));
        if (rename) {
            path = activity.listFragment.proposeNewFilePath(newName);
            name = activity.filer.getFileNameWithoutExtension(path);
            modified = true;
        }
        if (!modified)
            return;

        if (activity.filer.writeToFile(path, etEditor.getText().toString())) {
            activity.makeSnackBar("Changes saved to "+path);
            if (rename)
                activity.filer.delete(oldPath);
            modified = false;
        }
    }

    public void open(String filePath) {
        path = filePath;
    }
}
