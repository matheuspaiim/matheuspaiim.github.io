package com.matheuspaiim.librasstudio;

import android.app.Activity;
import android.net.Uri;
import android.webkit.WebView;

import androidx.browser.customtabs.CustomTabsIntent;

/**
 * Public Play Store edition.
 * Uses the device browser engine instead of an embedded WebView so the
 * production mobile site gets the exact same touch/layout behavior as Chrome.
 * No LibrasLab bridge or AccessibilityService code is compiled here.
 */
public final class NativeEdition {
    private NativeEdition() {}

    public static boolean openDedicatedExperience(Activity activity, String studioUrl) {
        String url = studioUrl.contains("?")
                ? studioUrl + "&publicApp=1"
                : studioUrl + "?publicApp=1";

        CustomTabsIntent intent = new CustomTabsIntent.Builder()
                .setShowTitle(false)
                .setUrlBarHidingEnabled(true)
                .build();

        intent.launchUrl(activity, Uri.parse(url));
        activity.finish();
        return true;
    }

    public static void attach(Activity activity, WebView webView) {
        // Public edition never reaches the embedded WebView path.
    }

    public static void onResume(Activity activity, WebView webView) {
        // No-op in public edition.
    }
}
