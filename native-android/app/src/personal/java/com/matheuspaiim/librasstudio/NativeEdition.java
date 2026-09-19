package com.matheuspaiim.librasstudio;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

/**
 * Personal Matheus edition.
 * This source set is not compiled into the public Play Store APK.
 */
public final class NativeEdition {
    private NativeEdition() {}

    public static void attach(Activity activity, WebView webView) {
        webView.addJavascriptInterface(new LibrasNativeBridge(activity), "LibrasNative");
    }

    public static void onResume(Activity activity, WebView webView) {
        // The common activity already notifies the web UI when Android resumes.
    }

    private static final class LibrasNativeBridge {
        private final Activity activity;

        LibrasNativeBridge(Activity activity) {
            this.activity = activity;
        }

        private SharedPreferences prefs() {
            return activity.getSharedPreferences(
                    LibrasLabAccessibilityService.PREFS,
                    Activity.MODE_PRIVATE
            );
        }

        private boolean accessibilityEnabled() {
            String enabled = Settings.Secure.getString(
                    activity.getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            );
            if (enabled == null) return false;
            ComponentName component = new ComponentName(
                    activity,
                    LibrasLabAccessibilityService.class
            );
            return enabled.toLowerCase().contains(
                    component.flattenToString().toLowerCase()
            );
        }

        @JavascriptInterface
        public String getState() {
            SharedPreferences prefs = prefs();
            try {
                JSONObject obj = new JSONObject();
                obj.put("native", true);
                obj.put("edition", "personal");
                obj.put("version", "0.2.0-personal");
                obj.put("accessibilityEnabled", accessibilityEnabled());
                obj.put(
                        "captureEnabled",
                        prefs.getBoolean(LibrasLabAccessibilityService.KEY_CAPTURE, false)
                );
                obj.put(
                        "sessionStartedAt",
                        prefs.getLong(LibrasLabAccessibilityService.KEY_STARTED, 0L)
                );
                obj.put(
                        "detections",
                        prefs.getString(LibrasLabAccessibilityService.KEY_DETECTIONS, "[]")
                );
                return obj.toString();
            } catch (Exception e) {
                return "{\"native\":true,\"edition\":\"personal\"}";
            }
        }

        @JavascriptInterface
        public void openAccessibilitySettings() {
            activity.runOnUiThread(() -> {
                try {
                    activity.startActivity(
                            new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                    );
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void startLibrasLabCapture() {
            prefs().edit()
                    .putBoolean(LibrasLabAccessibilityService.KEY_CAPTURE, true)
                    .putLong(
                            LibrasLabAccessibilityService.KEY_STARTED,
                            System.currentTimeMillis()
                    )
                    .putString(
                            LibrasLabAccessibilityService.KEY_DETECTIONS,
                            "[]"
                    )
                    .apply();
        }

        @JavascriptInterface
        public void stopLibrasLabCapture() {
            prefs().edit()
                    .putBoolean(LibrasLabAccessibilityService.KEY_CAPTURE, false)
                    .apply();
        }

        @JavascriptInterface
        public void clearLibrasLabDetections() {
            prefs().edit()
                    .putString(
                            LibrasLabAccessibilityService.KEY_DETECTIONS,
                            "[]"
                    )
                    .apply();
        }

        @JavascriptInterface
        public void openLibrasLab() {
            activity.runOnUiThread(() -> {
                try {
                    Intent intent = activity.getPackageManager()
                            .getLaunchIntentForPackage(
                                    LibrasLabAccessibilityService.LIBRASLAB_PACKAGE
                            );
                    if (intent != null) {
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        activity.startActivity(intent);
                    } else {
                        activity.startActivity(new Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse(
                                        "https://play.google.com/store/apps/details?id="
                                                + LibrasLabAccessibilityService.LIBRASLAB_PACKAGE
                                )
                        ));
                    }
                } catch (Exception ignored) {
                }
            });
        }
    }
}
