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
import android.widget.Button;
import android.widget.EditText;

import java.util.ArrayList;

/**
 * Created by aario on 3/16/17.
 */

public class EditorFragment extends Fragment {
    private MainActivity activity;
    private String path;
    private String name;
    private EditText etEditor;
    private EditText etTitle;
    ArrayList<String> textUndoHistory = new ArrayList<String>();
    ArrayList<Integer> selectionStartUndoHistory = new ArrayList<Integer>();
    ArrayList<Integer> selectionEndUndoHistory = new ArrayList<Integer>();
    private Button btUndo;
    private Button btRedo;
    private int undoHistoryCursor = 0;
    TextWatcher textWatcher = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {
        }

        @Override
        public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
            saveUndoRedo();
        }

        @Override
        public void afterTextChanged(Editable editable) {
            activity.editor_modified = true;
        }
    };

    private void saveUndoRedo() {
        if (textUndoHistory.size() > 0 && undoHistoryCursor < textUndoHistory.size() - 1) {
            for (int c = textUndoHistory.size() - 1; c >= undoHistoryCursor; c--) {
                textUndoHistory.remove(c);
                selectionStartUndoHistory.remove(c);
                selectionEndUndoHistory.remove(c);
            }
        }
        textUndoHistory.add(etEditor.getText().toString());
        selectionStartUndoHistory.add(etEditor.getSelectionStart());
        selectionEndUndoHistory.add(etEditor.getSelectionEnd());
        undoHistoryCursor = textUndoHistory.size() - 1;
        updateUndoRedoButtons();
    }

    private void retrieveUndoRedo() {
        etEditor.removeTextChangedListener(textWatcher);
        etEditor.setText(textUndoHistory.get(undoHistoryCursor).toString());
        etEditor.setSelection(
                selectionStartUndoHistory.get(undoHistoryCursor),
                selectionStartUndoHistory.get(undoHistoryCursor)
        );
        etEditor.addTextChangedListener(textWatcher);
        updateUndoRedoButtons();
    }

    private void updateUndoRedoButtons() {
        btUndo.setEnabled(textUndoHistory.size() > 0 && undoHistoryCursor > 0);
        btRedo.setEnabled(textUndoHistory.size() > 0 && undoHistoryCursor < textUndoHistory.size() - 1);
    }

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
        etEditor.addTextChangedListener(textWatcher);
        textUndoHistory.clear();
        selectionStartUndoHistory.clear();
        selectionEndUndoHistory.clear();
        btUndo = (Button) view.findViewById(R.id.btUndo);
        btUndo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                undoHistoryCursor--;
                retrieveUndoRedo();
            }
        });
        btRedo = (Button) view.findViewById(R.id.btRedo);
        btRedo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                undoHistoryCursor++;
                retrieveUndoRedo();
            }
        });
        saveUndoRedo();
        return view;
    }

    private void save() {
        String newName = etTitle.getText().toString();
        String oldPath = path;
        boolean rename = (!newName.equals(name));
        if (rename) {
            path = activity.listFragment.proposeNewFilePath(newName);
            name = activity.filer.getFileNameWithoutExtension(path);
        }

        if (activity.filer.writeToFile(path, etEditor.getText().toString())) {
            activity.makeSnackBar("Changes saved to " + path);
            if (rename)
                activity.filer.delete(oldPath);
            activity.editor_modified = false;
        }
    }

    public void open(String filePath) {
        path = filePath;
    }
}
