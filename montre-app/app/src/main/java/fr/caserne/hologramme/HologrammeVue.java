package fr.caserne.hologramme;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.PorterDuffXfermode;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.MotionEvent;
import android.view.View;

/**
 * Le trompe-l'œil (anamorphose) : le chef de poste est dessiné à plat sur l'écran rond, mais déformé exactement comme
 * le serait une petite personne debout sur le cadran, vue depuis notre œil. Vu de biais, il semble sortir de la montre.
 * Le gyroscope dit comment le poignet est tourné : la déformation est recalculée pour que l'illusion tienne.
 * Toucher l'écran = « je regarde ma montre comme ça » (le réglage).
 */
public class HologrammeVue extends View implements SensorEventListener {
    private static final int BANDES = 48;
    private static final float DIST = 13f;   // (l'œil à ~30 cm ; l'écran fait ~2,3 cm de rayon)
    private static final double TH0 = Math.toRadians(50), PH0 = -Math.PI / 2;   // (le regard de départ : depuis 6 h, à 50°)

    private final SensorManager capteurs;
    private final float[] rot = new float[9];
    private boolean aRot = false;
    private float[] oeilMonde = null;
    private double th = TH0, ph = PH0;
    private long dernier = 0;

    private Bitmap[] bandes;     // (la personne teintée hologramme, découpée en bandes horizontales, du haut vers le bas)
    private int bw, bh;
    private final Matrix m = new Matrix();
    private final float[] src = new float[6], dst = new float[6];
    private final Paint pBande = new Paint(Paint.FILTER_BITMAP_FLAG | Paint.ANTI_ALIAS_FLAG);
    private final Paint pSol = new Paint(Paint.ANTI_ALIAS_FLAG), pAnneau = new Paint(Paint.ANTI_ALIAS_FLAG), pOmbre = new Paint(Paint.ANTI_ALIAS_FLAG), pFaisceau = new Paint(Paint.ANTI_ALIAS_FLAG), pBord = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Path chemin = new Path();

    public HologrammeVue(Context c) {
        super(c);
        setBackgroundColor(Color.BLACK);
        capteurs = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        preparerPersonne();
        pAnneau.setStyle(Paint.Style.STROKE);
        pBord.setStyle(Paint.Style.STROKE); pBord.setColor(Color.argb(140, 94, 230, 255));
        pFaisceau.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.ADD));
    }

    // la personne : teinte bleue d'hologramme, lignes horizontales, bas fondu dans la lumière ; puis les bandes
    private void preparerPersonne() {
        BitmapFactory.Options o = new BitmapFactory.Options(); o.inScaled = false;
        Bitmap chef = BitmapFactory.decodeResource(getResources(), R.drawable.chef, o);
        bw = 200; bh = Math.round(bw * chef.getHeight() / (float) chef.getWidth());
        Bitmap holo = Bitmap.createBitmap(bw, bh, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(holo);
        Paint p = new Paint(Paint.FILTER_BITMAP_FLAG);
        c.drawBitmap(Bitmap.createScaledBitmap(chef, bw, bh, true), 0, 0, p);
        Paint t = new Paint(); t.setColorFilter(null); t.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP));
        t.setColor(Color.argb(95, 60, 190, 255)); c.drawRect(0, 0, bw, bh, t);
        t.setColor(Color.argb(80, 0, 10, 25)); for (int y = 0; y < bh; y += 3) c.drawRect(0, y, bw, y + 1.2f, t);
        Paint f = new Paint(); f.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.DST_OUT));
        f.setShader(new LinearGradient(0, bh, 0, bh * .85f, Color.argb(200, 0, 0, 0), Color.TRANSPARENT, Shader.TileMode.CLAMP));
        c.drawRect(0, bh * .85f, bw, bh, f);
        bandes = new Bitmap[BANDES];
        for (int k = 0; k < BANDES; k++) {   // (k = 0 : la bande du bas)
            int y0 = Math.round(bh * (1 - (k + 1) / (float) BANDES)), y1 = Math.round(bh * (1 - k / (float) BANDES));
            bandes[k] = Bitmap.createBitmap(holo, 0, Math.max(0, y0 - 1), bw, Math.max(2, Math.min(bh, y1 + 1) - Math.max(0, y0 - 1)));
        }
    }

    public void demarrer() {
        Sensor s = capteurs.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR);
        if (s == null) s = capteurs.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (s != null) capteurs.registerListener(this, s, SensorManager.SENSOR_DELAY_GAME);
    }
    public void arreter() { capteurs.unregisterListener(this); }

    @Override public void onSensorChanged(SensorEvent e) { SensorManager.getRotationMatrixFromVector(rot, e.values); aRot = true; if (oeilMonde == null) caler(); }
    @Override public void onAccuracyChanged(Sensor s, int a) { }

    // « je regarde ma montre comme ça » : la position actuelle du poignet = regarder depuis 6 h, à 50°
    private void caler() {
        if (!aRot) return;
        double[] e = { Math.cos(TH0) * Math.cos(PH0), Math.cos(TH0) * Math.sin(PH0), Math.sin(TH0) };
        oeilMonde = new float[3];
        for (int i = 0; i < 3; i++) oeilMonde[i] = (float) (rot[i * 3] * e[0] + rot[i * 3 + 1] * e[1] + rot[i * 3 + 2] * e[2]);
    }
    @Override public boolean onTouchEvent(MotionEvent ev) { if (ev.getAction() == MotionEvent.ACTION_DOWN) { caler(); return true; } return super.onTouchEvent(ev); }

    private void majVue(float dt) {
        double t = TH0, p = PH0;
        if (aRot && oeilMonde != null) {   // (le regard, ramené dans les axes de la montre)
            double ex = rot[0] * oeilMonde[0] + rot[3] * oeilMonde[1] + rot[6] * oeilMonde[2];
            double ey = rot[1] * oeilMonde[0] + rot[4] * oeilMonde[1] + rot[7] * oeilMonde[2];
            double ez = rot[2] * oeilMonde[0] + rot[5] * oeilMonde[1] + rot[8] * oeilMonde[2];
            t = Math.asin(Math.max(-1, Math.min(1, ez))); p = Math.atan2(ey, ex);
        } else { double s = System.nanoTime() / 1e9; t += Math.sin(s * .5) * .08; p += Math.sin(s * .37) * .25; }
        t = Math.max(Math.toRadians(22), Math.min(Math.toRadians(72), t));
        double k = 1 - Math.exp(-dt * 8); th += (t - th) * k; double d = Math.atan2(Math.sin(p - ph), Math.cos(p - ph)); ph += d * k;
    }

    // un point (x, y, z) au-dessus du cadran, en rayons d'écran → le point de l'écran sur la même ligne que l'œil
    private float R, C;
    private void ecran(double x, double y, double z, float[] out, int i) {
        double c = Math.cos(th), ex = DIST * c * Math.cos(ph), ey = DIST * c * Math.sin(ph), ez = DIST * Math.sin(th);
        double t = ez / (ez - z), px = ex + t * (x - ex), py = ey + t * (y - ey);
        out[i] = (float) (C + px * R); out[i + 1] = (float) (C - py * R);
    }

    @Override protected void onDraw(Canvas cv) {
        long n = System.nanoTime(); float dt = dernier == 0 ? .016f : Math.min(.1f, (n - dernier) / 1e9f); dernier = n;
        majVue(dt);
        int W = Math.min(getWidth(), getHeight()); R = W / 2f; C = R;
        double vx = Math.cos(ph), vy = Math.sin(ph), ux = -vy, uy = vx;
        double fx = vx * .3, fy = vy * .3, H = 1.02 + .012 * Math.sin(n / 9e8), L = H * bw / bh;
        float[] q = new float[6];
        ecran(fx, fy, 0, q, 0); float sx = q[0], sy = q[1], rs = R * .5f;

        // le sol lumineux et ses anneaux qui tournent (dans le plan de l'écran : pas déformés)
        pSol.setShader(new RadialGradient(sx, sy, rs, new int[]{Color.argb(97, 120, 235, 255), Color.argb(30, 60, 180, 255), Color.TRANSPARENT}, new float[]{0, .7f, 1}, Shader.TileMode.CLAMP));
        cv.drawCircle(sx, sy, rs, pSol);
        pAnneau.setStrokeWidth(R * .012f);
        for (int i = 0; i < 3; i++) {
            pAnneau.setColor(Color.argb((int) ((.75 - i * .22) * 255), 120, 240, 255));
            pAnneau.setPathEffect(i == 1 ? new DashPathEffect(new float[]{R * .04f, R * .05f}, (float) (n / 2.5e7 * (i + 1)) % (R * .09f)) : null);
            cv.drawCircle(sx, sy, rs * (.55f + i * .2f), pAnneau);
        }
        pBord.setStrokeWidth(R * .02f); cv.drawCircle(C, C, R * .985f, pBord);

        // son ombre, étirée à l'opposé de nous
        ecran(fx - vx * .16, fy - vy * .16, 0, q, 0);
        cv.save(); cv.translate(q[0], q[1]); cv.rotate((float) Math.toDegrees(-Math.atan2(vy, vx))); cv.scale(1.25f, .55f);
        pOmbre.setShader(new RadialGradient(0, 0, R * .26f, Color.argb(215, 0, 0, 0), Color.TRANSPARENT, Shader.TileMode.CLAMP));
        cv.drawCircle(0, 0, R * .26f, pOmbre); cv.restore();

        // la personne : chaque bande posée à sa place projetée
        int a = (int) (255 * (.86 + Math.random() * .08 - (Math.random() < .03 ? .3 : 0))); pBande.setAlpha(Math.max(60, a));
        for (int k = 0; k < BANDES; k++) {
            double z0 = H * k / BANDES, z1 = H * (k + 1) / BANDES;
            ecran(fx - ux * L / 2, fy - uy * L / 2, z1, dst, 0);   // (en haut à gauche)
            ecran(fx + ux * L / 2, fy + uy * L / 2, z1, dst, 2);   // (en haut à droite)
            ecran(fx - ux * L / 2, fy - uy * L / 2, z0, dst, 4);   // (en bas à gauche)
            Bitmap b = bandes[k]; src[0] = 0; src[1] = 0; src[2] = b.getWidth(); src[3] = 0; src[4] = 0; src[5] = b.getHeight();
            m.setPolyToPoly(src, 0, dst, 0, 3);
            cv.drawBitmap(b, m, pBande);
        }

        // un faisceau léger qui monte du sol
        float[] l = new float[4]; ecran(fx - ux * L * .7, fy - uy * L * .7, H, l, 0); ecran(fx + ux * L * .7, fy + uy * L * .7, H, l, 2);
        float[] hb = new float[2]; ecran(fx, fy, H * .9, hb, 0);
        pFaisceau.setShader(new LinearGradient(sx, sy, hb[0], hb[1], Color.argb(56, 94, 230, 255), Color.TRANSPARENT, Shader.TileMode.CLAMP));
        chemin.reset(); chemin.moveTo((float) (sx - ux * rs * .35), (float) (sy + uy * rs * .35)); chemin.lineTo((float) (sx + ux * rs * .35), (float) (sy - uy * rs * .35));
        chemin.lineTo(l[2], l[3]); chemin.lineTo(l[0], l[1]); chemin.close(); cv.drawPath(chemin, pFaisceau);

        postInvalidateOnAnimation();
    }
}
