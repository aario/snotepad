package info.aario.snotepad;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.text.Html;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.TextView;

import com.nononsenseapps.filepicker.FilePickerActivity;

import java.io.File;

/**
 * Created by aario on 3/16/17.
 */

public class AboutActivity extends Activity {
//    private MainActivity activity;
    private TextView tvAbout;
    private static final int FILE_CODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_about);
        tvAbout = (TextView) findViewById(R.id.tvAbout);
        String aboutHtml = getResources().getString(R.string.tvAbout_text);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            tvAbout.setText(Html.fromHtml(aboutHtml, Html.FROM_HTML_MODE_COMPACT));
        } else {
            tvAbout.setText(Html.fromHtml(aboutHtml));
        }

        TextView tvVersion = (TextView) findViewById(R.id.tvVersion);
        try {
            tvVersion.setText(tvVersion.getText() + getPackageManager().getPackageInfo(getPackageName(), 0).versionName);
        } catch (PackageManager.NameNotFoundException e) {
            tvVersion.setVisibility(View.INVISIBLE);
        }

        Button bt_donate = (Button) findViewById(R.id.bt_donate);
        bt_donate.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(getResources().getString(R.string.donate_url)));
                startActivity(i);
            }
        });

    }

}
