package fr.caserne.hologramme;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.ScrollView;
import android.widget.TextView;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Locale;

/** L'hologramme sur la montre : le chef de poste en trompe-l'œil, debout sur le cadran (dessiné directement, sans page web :
 *  les montres Wear OS n'ont pas de moteur web). Si quelque chose ne va pas, la cause s'affiche au lieu que l'appli se ferme. */
public class MainActivity extends Activity {
    private HologrammeVue vue;
    private TextToSpeech voix;

    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        final SharedPreferences prefs = getSharedPreferences("erreurs", MODE_PRIVATE);
        final Thread.UncaughtExceptionHandler avant = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> { prefs.edit().putString("derniere", trace(e)).commit(); if (avant != null) avant.uncaughtException(t, e); });
        String derniere = prefs.getString("derniere", null);
        if (derniere != null) { prefs.edit().remove("derniere").apply(); afficher("Plantage précédent :\n\n" + derniere); return; }
        try {
            vue = new HologrammeVue(this);
            setContentView(vue);
        } catch (Throwable e) { afficher("Erreur :\n\n" + trace(e)); return; }
        // (il dit bonjour, si la montre sait parler)
        try {
            voix = new TextToSpeech(this, s -> {
                if (s != TextToSpeech.SUCCESS || voix == null) return;
                voix.setLanguage(Locale.FRANCE); voix.setPitch(.8f);
                voix.speak("Allô ? Ici le chef de poste. Je te reçois cinq sur cinq, depuis ta montre !", TextToSpeech.QUEUE_FLUSH, null, "bonjour");
            });
        } catch (Throwable e) { voix = null; }
    }

    private void afficher(String texte) {
        TextView t = new TextView(this);
        t.setText(texte); t.setTextColor(Color.WHITE); t.setTextSize(11); t.setGravity(Gravity.CENTER_HORIZONTAL); t.setPadding(40, 60, 40, 80);
        ScrollView s = new ScrollView(this); s.setBackgroundColor(Color.BLACK); s.addView(t);
        setContentView(s);
    }
    private static String trace(Throwable e) { StringWriter w = new StringWriter(); e.printStackTrace(new PrintWriter(w)); String s = w.toString(); return s.length() > 1500 ? s.substring(0, 1500) : s; }

    @Override protected void onResume() { super.onResume(); if (vue != null) vue.demarrer(); }
    @Override protected void onPause() { if (vue != null) vue.arreter(); super.onPause(); }
    @Override protected void onDestroy() { if (voix != null) { voix.stop(); voix.shutdown(); } super.onDestroy(); }
}
