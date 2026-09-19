package com.matheuspaiim.librasstudio;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String STUDIO_URL = "https://matheuspaiim.github.io/libras-studio/";
    private static final String STUDIO_HOST = "matheuspaiim.github.io";
    private static final String STUDIO_PATH = "/libras-studio/";
    private static final int FILE_CHOOSER_REQUEST = 4301;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);

        webView.addJavascriptInterface(new LibrasNativeBridge(), "LibrasNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                String path = uri.getPath();
                if (STUDIO_HOST.equalsIgnoreCase(host) && path != null && path.startsWith(STUDIO_PATH)) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        webView.loadUrl(STUDIO_URL);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.postDelayed(() ->
                    webView.evaluateJavascript("window.dispatchEvent(new Event('librasstudio-native-resume'));", null),
                    250
            );
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST) {
            if (fileCallback != null) {
                Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                fileCallback.onReceiveValue(result);
                fileCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    private SharedPreferences bridgePrefs() {
        return getSharedPreferences(LibrasLabAccessibilityService.PREFS, MODE_PRIVATE);
    }

    private boolean accessibilityEnabled() {
        String enabled = Settings.Secure.getString(
                getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );
        if (enabled == null) return false;
        ComponentName cn = new ComponentName(this, LibrasLabAccessibilityService.class);
        return enabled.toLowerCase().contains(cn.flattenToString().toLowerCase());
    }

    public class LibrasNativeBridge {
        @JavascriptInterface
        public String getState() {
            SharedPreferences prefs = bridgePrefs();
            try {
                JSONObject obj = new JSONObject();
                obj.put("native", true);
                obj.put("version", "0.1.0");
                obj.put("accessibilityEnabled", accessibilityEnabled());
                obj.put("captureEnabled", prefs.getBoolean(LibrasLabAccessibilityService.KEY_CAPTURE, false));
                obj.put("sessionStartedAt", prefs.getLong(LibrasLabAccessibilityService.KEY_STARTED, 0L));
                obj.put("detections", prefs.getString(LibrasLabAccessibilityService.KEY_DETECTIONS, "[]"));
                return obj.toString();
            } catch (Exception e) {
                return "{\"native\":true}";
            }
        }

        @JavascriptInterface
        public void openAccessibilitySettings() {
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void startLibrasLabCapture() {
            bridgePrefs().edit()
                    .putBoolean(LibrasLabAccessibilityService.KEY_CAPTURE, true)
                    .putLong(LibrasLabAccessibilityService.KEY_STARTED, System.currentTimeMillis())
                    .putString(LibrasLabAccessibilityService.KEY_DETECTIONS, "[]")
                    .apply();
        }

        @JavascriptInterface
        public void stopLibrasLabCapture() {
            bridgePrefs().edit()
                    .putBoolean(LibrasLabAccessibilityService.KEY_CAPTURE, false)
                    .apply();
        }

        @JavascriptInterface
        public void clearLibrasLabDetections() {
            bridgePrefs().edit()
                    .putString(LibrasLabAccessibilityService.KEY_DETECTIONS, "[]")
                    .apply();
        }

        @JavascriptInterface
        public void openLibrasLab() {
            runOnUiThread(() -> {
                try {
                    Intent intent = getPackageManager().getLaunchIntentForPackage(LibrasLabAccessibilityService.LIBRASLAB_PACKAGE);
                    if (intent != null) {
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } else {
                        startActivity(new Intent(
                                Intent.ACTION_VIEW,
                                Uri.parse("https://play.google.com/store/apps/details?id=" + LibrasLabAccessibilityService.LIBRASLAB_PACKAGE)
                        ));
                    }
                } catch (Exception ignored) {
                }
            });
        }
    }
}
