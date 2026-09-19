package com.matheuspaiim.librasstudio;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.graphics.Color;
import android.view.Gravity;
import android.view.MotionEvent;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String STUDIO_URL = "file:///android_asset/web/index.html?native=android&apk=7";
    private static final String STUDIO_HOST = "matheuspaiim.github.io";
    private static final String STUDIO_PATH = "/libras-studio/";
    private static final int FILE_CHOOSER_REQUEST = 4301;

    private int nativeTouchCount = 0;
    private TextView nativeTouchBadge;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (NativeEdition.openDedicatedExperience(this, STUDIO_URL)) {
            return;
        }

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(
                webView,
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                )
        );

        nativeTouchBadge = new TextView(this);
        nativeTouchBadge.setText("NATIVE TOUCH 0");
        nativeTouchBadge.setTextColor(Color.WHITE);
        nativeTouchBadge.setTextSize(10);
        nativeTouchBadge.setGravity(Gravity.CENTER);
        nativeTouchBadge.setBackgroundColor(Color.rgb(46, 32, 82));
        nativeTouchBadge.setPadding(18, 8, 18, 8);
        nativeTouchBadge.setClickable(false);
        nativeTouchBadge.setFocusable(false);

        FrameLayout.LayoutParams diagParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
        );
        diagParams.gravity = Gravity.TOP | Gravity.LEFT;
        diagParams.leftMargin = 12;
        diagParams.topMargin = 70;
        root.addView(nativeTouchBadge, diagParams);

        setContentView(root);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setTextZoom(100);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);

        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.setClickable(true);
        webView.setEnabled(true);
        webView.requestFocus();
        webView.setOnTouchListener((view, event) -> {
            if (event.getActionMasked() == MotionEvent.ACTION_DOWN) {
                nativeTouchCount++;
                nativeTouchBadge.setText("NATIVE TOUCH " + nativeTouchCount);
            }
            return false;
        });

        NativeEdition.attach(this, webView);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("file".equalsIgnoreCase(uri.getScheme())) {
                    return false;
                }
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
            NativeEdition.onResume(this, webView);
            webView.postDelayed(() ->
                    webView.evaluateJavascript(
                            "window.dispatchEvent(new Event('librasstudio-native-resume'));",
                            null
                    ),
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
}
