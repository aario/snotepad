package info.aario.snotepad;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

/**
 * Created by aario on 3/16/17.
 */

public class SettingsFragment extends Fragment {
    private MainActivity activity;
    private Button btChangePath;
    private TextView tvPath;
    private static final int PICKFILE_REQUEST_CODE=3;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        activity = (MainActivity) getActivity();
        View view = inflater.inflate(R.layout.settings_fragment, container, false);
        tvPath = (TextView) view.findViewById(R.id.tvPath);
        tvPath.setText(activity.getPath());
        btChangePath = (Button) view.findViewById(R.id.btChangePath);
        btChangePath.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
            }
        });
        FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
        fab.setImageDrawable(ContextCompat.getDrawable(activity, android.R.drawable.ic_menu_save));
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                activity.setPath(tvPath.getText().toString());
            }
        });

        return view;
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        String Fpath = data.getDataString();
        tvPath.setText(Fpath);
        super.onActivityResult(requestCode, resultCode, data);
    }
}
