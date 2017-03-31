package info.aario.snotepad;

import android.content.Context;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by aario on 3/16/17.
 */

public class Filer {
    private MainActivity activity;
    public SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");

    public Filer(MainActivity mainActivity) {
        activity = mainActivity;
    }

    public boolean exists(String path) {
        return new File(path).exists();
    }

    public String getFilePath(String path) {
        return new File(path).getParent();
    }

    public String getFileExtension(String path) {
        int lastPeriodPos = path.lastIndexOf('.');
        if (lastPeriodPos > 0)
            return path.substring(path.lastIndexOf('.'));
        return "";
    }

    public String getFileName(String path) {
        return new File(path).getName();
    }

    public String getFileNameWithoutExtension(String path) {
        String fileName = getFileName(path);
        int lastPeriodPos = fileName.lastIndexOf('.');
        if (lastPeriodPos > 0)
            return fileName.substring(0, lastPeriodPos);
        return fileName;
    }

    public boolean writeToFile(String path, String data) {
        try {
            File file = new File(path);
            FileWriter writer = new FileWriter(file);
            writer.append(data);
            writer.flush();
            writer.close();
            return true;
        } catch (IOException e) {
            activity.toast("File write failed: " + e.toString());
            return false;
        }
    }

    public boolean delete(String path) {
        try {
            new File(path).delete();
            return true;
        } catch (RuntimeException e) {
            activity.toast("File remove failed: " + e.toString());
            return false;
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

    public String getModifiedTimestamp(String filePath) {
        File fl = new File(filePath);
        if (fl.exists())
            return dateFormat.format(new Date(fl.lastModified()));
        return "";
    }

}
