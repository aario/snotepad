package info.aario.snotepad;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Created by aario on 3/16/17.
 */

public class Filer {
    private String path;
    private MainActivity activity;

    public Filer(MainActivity mainActivity) {
        activity = mainActivity;
        path = activity.getPath();
    }

    public boolean exists(String path) {
        return new File(path).exists();
    }

    public void writeToFile(String path, String data) {
        try {
            File file = new File(path);
            FileWriter writer = new FileWriter(file);
            writer.append(data);
            writer.flush();
            writer.close();
        } catch (IOException e) {
            activity.toast("File write failed: " + e.toString());
        }
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

    public String getStringFromFile(String filePath) {
        File fl = new File(filePath);

        String ret = "";
        try {
            FileInputStream fin = new FileInputStream(fl);
            ret = convertStreamToString(fin);
            //Make sure you close all streams.
            fin.close();
        } catch (IOException e) {
            activity.toast("File read failed: " + e.toString());
        } finally {
            return ret;
        }
    }

}
