package fr.caserne.hologramme;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ScrollView;
import android.widget.TextView;

import java.io.PrintWriter;
import java.io.StringWriter;

/** L'hologramme sur la montre : la page /montre du site de la caserne, en plein écran, l'écran toujours allumé.
 *  Si quelque chose ne va pas, l'appli ne se ferme pas : elle affiche la cause à l'écran (et la garde pour le lancement suivant). */
public class MainActivity extends Activity {
    private static final String ADRESSE = "https://ancien-de-la-caserne-nf.parisien2403.workers.dev/montre?app=1";
    private WebView web;

    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        final SharedPreferences prefs = getSharedPreferences("erreurs", MODE_PRIVATE);
        // (un plantage plus tard : on le note, on le montrera au prochain lancement)
        final Thread.UncaughtExceptionHandler avant = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            prefs.edit().putString("derniere", trace(e)).commit();
            if (avant != null) avant.uncaughtException(t, e);
        });
        String derniere = prefs.getString("derniere", null);
        if (derniere != null) { prefs.edit().remove("derniere").apply(); afficher("Plantage précédent :\n\n" + derniere); return; }
        try {
            web = new WebView(this);
            web.setBackgroundColor(Color.BLACK);
            WebSettings r = web.getSettings();
            r.setJavaScriptEnabled(true);
            r.setDomStorageEnabled(true);
            r.setMediaPlaybackRequiresUserGesture(false);
            web.setWebViewClient(new WebViewClient() {
                @Override public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
                    afficher("Le moteur web de la montre s'est arrêté" + (d != null && d.didCrash() ? " (plantage)." : " (mémoire)."));
                    return true;
                }
            });
            web.setWebChromeClient(new WebChromeClient() {
                @Override public void onPermissionRequest(PermissionRequest demande) { demande.grant(demande.getResources()); }
            });
            setContentView(web);
            web.loadUrl(ADRESSE);
        } catch (Throwable e) {
            Log.e("Hologramme", "WebView", e);
            afficher("Pas de moteur web utilisable sur cette montre :\n\n" + trace(e));
        }
    }

    private void afficher(String texte) {
        TextView t = new TextView(this);
        t.setText(texte); t.setTextColor(Color.WHITE); t.setTextSize(11); t.setGravity(Gravity.CENTER_HORIZONTAL);
        t.setPadding(40, 60, 40, 80);
        ScrollView s = new ScrollView(this); s.setBackgroundColor(Color.BLACK); s.addView(t);
        setContentView(s);
    }

    private static String trace(Throwable e) { StringWriter w = new StringWriter(); e.printStackTrace(new PrintWriter(w)); String s = w.toString(); return s.length() > 1500 ? s.substring(0, 1500) : s; }

    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onPause() { if (web != null) web.onPause(); super.onPause(); }
    @Override public void onBackPressed() { if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
