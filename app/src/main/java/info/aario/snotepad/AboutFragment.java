package info.aario.snotepad;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.text.Html;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.nononsenseapps.filepicker.FilePickerActivity;

import java.io.File;

/**
 * Created by aario on 3/16/17.
 */

public class AboutFragment extends Fragment {
    private MainActivity activity;
    private TextView tvAbout;
    private static final int FILE_CODE = 1;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        activity = (MainActivity) getActivity();
        View view = inflater.inflate(R.layout.about_fragment, container, false);
        tvAbout = (TextView) view.findViewById(R.id.tvAbout);
        String aboutHtml = getResources().getString(R.string.tvAbout_text);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            tvAbout.setText(Html.fromHtml(aboutHtml, Html.FROM_HTML_MODE_COMPACT));
        } else {
            tvAbout.setText(Html.fromHtml(aboutHtml));
        }

        TextView tvVersion = (TextView) view.findViewById(R.id.tvVersion);
        try {
            tvVersion.setText(tvVersion.getText() + activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0).versionName);
        } catch (PackageManager.NameNotFoundException e) {
            tvVersion.setVisibility(View.INVISIBLE);
        }

        FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
        fab.setImageDrawable(ContextCompat.getDrawable(activity, android.R.drawable.ic_dialog_info));
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(getResources().getString(R.string.donate_url)));
                startActivity(i);
            }
        });

        return view;
    }

}
