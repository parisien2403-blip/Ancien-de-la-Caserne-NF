package fr.caserne.hologramme;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** L'hologramme sur la montre : la page /montre du site de la caserne, en plein écran, l'écran toujours allumé. */
public class MainActivity extends Activity {
    private static final String ADRESSE = "https://ancien-de-la-caserne-nf.parisien2403.workers.dev/montre?app=1";
    private WebView web;

    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings r = web.getSettings();
        r.setJavaScriptEnabled(true);
        r.setDomStorageEnabled(true);
        r.setMediaPlaybackRequiresUserGesture(false);
        r.setUseWideViewPort(true);
        r.setLoadWithOverviewMode(true);
        web.setWebViewClient(new WebViewClient());   // (les liens restent dans l'appli)
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest demande) { demande.grant(demande.getResources()); }
        });
        setContentView(web);
        if (etat != null) web.restoreState(etat); else web.loadUrl(ADRESSE);
    }

    @Override protected void onSaveInstanceState(Bundle etat) { super.onSaveInstanceState(etat); web.saveState(etat); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
    @Override protected void onPause() { web.onPause(); super.onPause(); }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
