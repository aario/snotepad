package info.aario.snotepad;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
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
    private String name;
    private View view;
    private EditText etEditor;
    private EditText etTitle;
    private String path;
    ArrayList<String> textUndoHistory = new ArrayList<String>();
    ArrayList<Integer> selectionStartUndoHistory = new ArrayList<Integer>();
    ArrayList<Integer> selectionEndUndoHistory = new ArrayList<Integer>();
    private Button btUndo;
    private Button btRedo;
    private Button btSave;
    private Button btShare;
    private long tLastEdit;
    private String previousText;
    private int undoHistoryCursor = 0;
    TextWatcher textWatcher = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {
            if (System.currentTimeMillis() - tLastEdit > 1000 ||
                Math.abs(etEditor.getText().length() - textUndoHistory.get(undoHistoryCursor).toString().length()) > 8 ) {
                saveUndoRedo();
            }
            previousText = new String(charSequence.toString());
        }

        @Override
        public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
            tLastEdit = System.currentTimeMillis();
//            activity.toast(lastChar(previousText,charSequence.toString()) + "");
            if (lastChar(previousText, charSequence.toString()) == ' ') saveUndoRedo();
        }

        @Override
        public void afterTextChanged(Editable editable) {
            activity.editor_modified = true;
            save();
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

    public char lastChar(String oldStr, String newStr){
        String shorter, longer;
//        Log.d("string",oldStr+"");
//        Log.d("string",newStr+"");

        //find which string is shorter so that we don't end up out of bounds
        if (oldStr.length()<newStr.length() ) {
            shorter = oldStr;
            longer = newStr;
        } else {
            shorter = newStr;
            longer = oldStr;
        }

        //find the first character that is different and return it
        for (int i = 0; i < shorter.length(); i++) {
            if (longer.charAt(i) != shorter.charAt(i)) return longer.charAt(i);
        }

        //if no characters are different then return the last char of the longer string
        //this means that the undo will be saved if the last char the user erased is a space
        Log.d("longer",longer);
        return(longer.charAt(longer.length()-1));
    }

    public void onPrepareOptionsMenu(Menu menu) {
        if (menu != null) {
            menu.findItem(R.id.action_refresh).setVisible(false);
            menu.findItem(R.id.action_sort_by_name).setVisible(false);
            menu.findItem(R.id.action_sort_by_date).setVisible(false);
            activity.invalidateOptionsMenu();
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        activity = (MainActivity) getActivity();
        view = inflater.inflate(R.layout.editor_fragment, container, false);

        Toolbar toolbar = (Toolbar) view.findViewById(R.id.toolbar);

        //Set global action bar to this fragment's actions
        AppCompatActivity rootActivity = (AppCompatActivity) getActivity();
        rootActivity.setSupportActionBar(toolbar);
        rootActivity.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        rootActivity.getSupportActionBar().setDisplayShowTitleEnabled(false);

        setHasOptionsMenu(true);

        etTitle = (EditText) view.findViewById(R.id.etTitle);
        path = activity.getOpenedFilePath();
        name = activity.filer.getFileNameWithoutExtension(path);
        etTitle.setText(name);
        etEditor = (EditText) view.findViewById(R.id.etEditor);
        if (activity.filer.exists(path))
            etEditor.setText(activity.filer.getStringFromFile(path));
        etEditor.addTextChangedListener(textWatcher);

        textUndoHistory.clear();
        selectionStartUndoHistory.clear();
        selectionEndUndoHistory.clear();
        View rootView = view.getRootView();
        btUndo = (Button) rootView.findViewById(R.id.btUndo);
        btUndo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //due to grouping the last few keystrokes might not have been saved
                //save them now except if we are in the middle of an undo streak
                //(we don't want to reset the undo stack on every undo)
                if (undoHistoryCursor == textUndoHistory.size() - 1) saveUndoRedo();
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
        tLastEdit = System.currentTimeMillis();
        saveUndoRedo();
        previousText = (String)etEditor.getText().toString();
        return view;
    }

    private String getEditorText() {
        return etEditor.getText().toString();
    }

    public void save() {
        String newName = etTitle.getText().toString();
        String oldPath = path;
        boolean rename = (!newName.equals(name));
        if (rename) {
            path = activity.listFragment.proposeNewFilePath(newName);
            name = activity.filer.getFileNameWithoutExtension(path);
        }

        if (activity.filer.writeToFile(path, getEditorText())) {
            if (rename)
                activity.filer.delete(oldPath);
            activity.editor_modified = false;
        }
    }

    private void share() {
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_TEXT, getEditorText());
        sendIntent.setType("text/plain");
        startActivity(sendIntent);
    }

}
