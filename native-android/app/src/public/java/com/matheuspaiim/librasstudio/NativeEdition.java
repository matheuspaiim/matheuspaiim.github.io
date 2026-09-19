package com.matheuspaiim.librasstudio;

import android.app.Activity;
import android.webkit.WebView;

/**
 * Public Play Store edition.
 * Intentionally contains no LibrasLab bridge, accessibility service or
 * cross-app capture code.
 */
public final class NativeEdition {
    private NativeEdition() {}

    public static void attach(Activity activity, WebView webView) {
        // Public edition intentionally exposes no LibrasNative bridge.
    }

    public static void onResume(Activity activity, WebView webView) {
        // No-op in public edition.
    }
}
