package com.matheuspaiim.librasstudio;

import android.accessibilityservice.AccessibilityService;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.Normalizer;
import java.util.ArrayDeque;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

public class LibrasLabAccessibilityService extends AccessibilityService {
    public static final String PREFS = "libraslab_bridge";
    public static final String KEY_CAPTURE = "capture_enabled";
    public static final String KEY_DETECTIONS = "detections";
    public static final String KEY_STARTED = "session_started_at";
    public static final String LIBRASLAB_PACKAGE = "com.toleio.brazil";

    private long lastScanAt = 0L;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        if (!LIBRASLAB_PACKAGE.contentEquals(event.getPackageName())) return;

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_CAPTURE, false)) return;

        long now = SystemClock.elapsedRealtime();
        if (now - lastScanAt < 450) return;
        lastScanAt = now;

        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return;

        LinkedHashMap<String, String> found = new LinkedHashMap<>();
        ArrayDeque<AccessibilityNodeInfo> queue = new ArrayDeque<>();
        queue.add(root);

        int visited = 0;
        while (!queue.isEmpty() && visited < 650) {
            AccessibilityNodeInfo node = queue.removeFirst();
            visited++;

            addText(found, node.getText());
            addText(found, node.getContentDescription());

            int count = Math.min(node.getChildCount(), 60);
            for (int i = 0; i < count; i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) queue.addLast(child);
            }
        }

        if (!found.isEmpty()) mergeDetections(prefs, found);
    }

    private void addText(Map<String, String> found, CharSequence value) {
        if (value == null) return;
        String raw = value.toString().replace('\n', ' ').replace('\r', ' ').trim().replaceAll("\\s+", " ");
        if (raw.isEmpty() || raw.length() > 120) return;
        if (raw.startsWith("http://") || raw.startsWith("https://")) return;

        String key = normalize(raw);
        if (!key.isEmpty()) found.putIfAbsent(key, raw);
    }

    private String normalize(String value) {
        String s = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
        return s;
    }

    private void mergeDetections(SharedPreferences prefs, Map<String, String> found) {
        try {
            String stored = prefs.getString(KEY_DETECTIONS, "[]");
            JSONArray arr = new JSONArray(stored == null ? "[]" : stored);
            LinkedHashMap<String, JSONObject> byKey = new LinkedHashMap<>();

            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.optJSONObject(i);
                if (obj == null) continue;
                String text = obj.optString("text", "");
                String key = normalize(text);
                if (!key.isEmpty()) byKey.put(key, obj);
            }

            long now = System.currentTimeMillis();
            for (Map.Entry<String, String> entry : found.entrySet()) {
                JSONObject obj = byKey.get(entry.getKey());
                if (obj == null) {
                    obj = new JSONObject();
                    obj.put("text", entry.getValue());
                    obj.put("firstSeen", now);
                    obj.put("lastSeen", now);
                    obj.put("count", 1);
                    byKey.put(entry.getKey(), obj);
                } else {
                    obj.put("lastSeen", now);
                    obj.put("count", obj.optInt("count", 0) + 1);
                }
            }

            JSONArray out = new JSONArray();
            int skip = Math.max(0, byKey.size() - 450);
            int i = 0;
            for (JSONObject obj : byKey.values()) {
                if (i++ < skip) continue;
                out.put(obj);
            }
            prefs.edit().putString(KEY_DETECTIONS, out.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onInterrupt() {
    }
}
