package com.matheuspaiim.librasstudio;

import android.app.Activity;
import android.webkit.WebView;

/**
 * Public Play Store edition.
 * No LibrasLab bridge or AccessibilityService code is compiled here.
 */
public final class NativeEdition {
    private NativeEdition() {}

    public static boolean openDedicatedExperience(Activity activity, String studioUrl) {
        return false;
    }

    public static void attach(Activity activity, WebView webView) {
        // Public edition exposes no native bridge.
    }

    public static void onResume(Activity activity, WebView webView) {
        // No-op in public edition.
    }
}
