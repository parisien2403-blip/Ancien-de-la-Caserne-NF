"""La façade sur rue (82, rue du Faubourg-Poissonnière), en vrai relief — d'après la photo de la rue (Google, mars 2023)
et aux mêmes places que dans matrice.js (construireRue : 56 m de large, 22 m de haut, 14 m de profondeur ; 15 travées de 3,4 m ;
les fenêtres des cinq étages à 6,35 + 3 f m, 1,3 × 1,9 m ; celles du rez-de-chaussée à barreaux, de 1,1 à 4,7 m ; les lucarnes, les cheminées) —
ainsi les fenêtres allumées la nuit tombent juste.
- le rez-de-chaussée en bossage rustique (pierres piquées, joints creux), ses hautes fenêtres à barreaux cerclées de pierre lisse et leur clé ;
- le bandeau ; au-dessus, la pierre de taille à joints (refends) ; les fenêtres en creux dans leur chambranle, l'appui sur deux consoles,
  la barre d'appui en fer, au premier étage une corniche au-dessus ; le frontispice du porche en bossage jusqu'au bandeau du haut ;
- la grande corniche à modillons ; le toit mansardé en ardoise, ses lucarnes à fronton (triangulaire, cintré, en alternance) ;
  ses hautes souches de cheminée en brique rouge et leurs pots.
Repère de Blender : la façade est le plan y = F = -29,35, tournée vers -y (la rue) ; d = la profondeur depuis la façade (négatif : en saillie)."""
import math, random
from mathutils import Matrix
from horloge import Atelier, mat, mat_tex, mur_perce
from porche import cases

F = -29.35; LARG = 56.0; HF = 22.0; PROF = 13.6; RET = .3
COLS = [k * 3.4 for k in range(-7, 8)]

def envergure(b):
    """ce que l'on refait (repère de Blender, boîte x0, x1, y0, y1, z0, z1) : la façade de 1990 et son toit ; on garde le décor du passage et les petites choses posées sur la façade"""
    if b[0] < -28.4 or b[1] > 28.4 or b[2] < F - .95 or b[3] > -15.0 or b[4] < -.1 or b[5] > 30: return False
    if max(abs(b[0]), abs(b[1])) <= 2.45 and b[5] <= 4.5: return False
    if b[4] >= 21.0: return True
    return max(b[1] - b[0], b[3] - b[2], b[5] - b[4]) > 3.0

def construire():
    BOSS = mat_tex("nc_bossage", "bossage", .9, 1.2); TAILLE = mat_tex("nc_socle", "socle", .85, 1.2); LISSE = mat_tex("nc_pierre", "pierre", .7, .6)
    BRIQUE = mat_tex("nc_brique", "brique", .9, 1.0); ARDOISE = mat_tex("nc_ardoise", "ardoise", .6, 1.0)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); RIDEAU = mat("nc_rideau", (.86, .84, .78), .9); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45)
    FER = mat("nc_fer", (.05, .05, .055), .4, .7); ZINC = mat("nc_zinc", (.42, .45, .48), .4, .7); POT = mat("nc_pot", (.62, .27, .16), .8)
    VERT = mat("nc_vitre_rdc", (.13, .19, .16), .15, .2); PASS = mat("nc_passage", (.83, .80, .73), .9)
    rnd = random.Random(82); A = Atelier()
    def de(m, x0, x1, d0, d1, h0, h1, uv=2.0): A.de(m, x0, x1, F + d0, F + d1, h0, h1, uv)
    # ---- les ouvertures (comme la toile de 1990) ----
    rdc = [(cx - .75, cx + .75, 1.1, 4.7) for cx in COLS if abs(cx) >= 6]
    etg = []
    for f in range(5):
        for cx in COLS:
            y0 = 6.35 + f * 3; b, t = y0 + .65, y0 + 2.55
            if abs(cx) < 4.2:
                if f == 0: continue
                if f == 1: b, t = 10.95, 12.3
            etg.append((cx - .65, cx + .65, b, t, f))
    PASSAGE = (-2.4, 2.4, 0, 4.4)
    trous = rdc + [e[:4] for e in etg] + [PASSAGE]
    # ---- le mur : la peau percée, la masse derrière (percée du passage : ses murs, son plafond) ----
    for x0, x1, h0, h1 in cases(-LARG / 2, LARG / 2, 0, HF, trous):
        de(TAILLE if h0 >= 6.0 else BOSS, x0, x1, 0, RET, h0, h1)
    for x0, x1, h0, h1 in cases(-LARG / 2, LARG / 2, 0, HF, [PASSAGE]): de(PASS, x0, x1, RET, PROF, h0, h1)
    # ---- le bossage rustique : le rez-de-chaussée (jusqu'à 6 m), le frontispice du porche (jusqu'à 10,4 m) ----
    def bossage(x0, x1, z0, z1, evite):
        z = z0; r = 0
        while z < z1 - .05:
            zz = min(z + .55, z1); x = x0 - (.55 if r % 2 else 0); i = 0
            while x < x1:
                xb = min(x + (1.1 if (i + r) % 3 else .85), x1); a = max(x, x0)
                if xb - a > .08:
                    for p0, p1, q0, q1 in cases(a + .02, xb - .02, z + .02, zz - .02, evite): de(BOSS, p0, p1, -.12, 0, q0, q1)
                x = xb; i += 1
            z = zz; r += 1
    cadres = [(x0 - .2, x1 + .2, h0 - .15, h1 + .2) for x0, x1, h0, h1 in rdc]
    bossage(-LARG / 2, LARG / 2, 0, 6.0, cadres + [(-3.9, 3.9, 0, 6.0)])
    bossage(-3.9, 3.9, 4.4, 10.4, [(-3.37, 3.52, 4.4, 10.08)])   # (la gravure, au milieu : entree.py)
    for x0, x1 in ((-3.9, -2.4), (2.4, 3.9)): bossage(x0, x1, 0, 4.4, [])
    # ---- les fenêtres du rez-de-chaussée : cadre de pierre lisse, clé, appui ; vitre sombre, croisée, barreaux ----
    for x0, x1, h0, h1 in rdc:
        cx = (x0 + x1) / 2
        de(VERT, x0, x1, RET - .04, RET, h0, h1, 1)
        for xx in (x0, cx - .04, x1 - .08): de(FER, xx, xx + .08, RET - .1, RET - .04, h0, h1, 1)
        de(FER, x0, x1, RET - .1, RET - .04, h0 + (h1 - h0) * .3, h0 + (h1 - h0) * .3 + .06, 1)
        for k in range(12): de(FER, x0 + .06 + k * .12, x0 + .085 + k * .12, -.02, 0, h0, h1, 1)
        for zz in (h0 + .15, (h0 + h1) / 2, h1 - .15): de(FER, x0, x1, -.04, -.02, zz, zz + .04, 1)
        for p0, p1, q0, q1 in cases(x0 - .2, x1 + .2, h0, h1 + .2, [(x0, x1, h0, h1)]): de(LISSE, p0, p1, -.06, 0, q0, q1)
        de(LISSE, x0 - .3, x1 + .3, -.2, .05, h0 - .15, h0)
        A.prisme(LISSE, [(F - .14, h1 + .05), (F - .14, h1 + .42), (F, h1 + .42), (F, h1 + .05)], cx - .2, cx + .2)
    # ---- les bandeaux : à 6 m (sur toute la largeur), en haut du frontispice ----
    de(LISSE, -LARG / 2, LARG / 2, -.2, 0, 6.0, 6.35); de(LISSE, -LARG / 2, LARG / 2, -.26, -.14, 6.27, 6.35)
    de(LISSE, -4.15, 4.15, -.32, 0, 10.4, 10.75); de(LISSE, -4.2, 4.2, -.38, -.2, 10.67, 10.78)
    # ---- les fenêtres des étages ----
    for x0, x1, b, t, f in etg:
        cx = (x0 + x1) / 2
        m = RIDEAU if rnd.random() < .5 else VITRE
        de(m, x0, x1, RET - .03, RET, b, t, 1)
        for xx in (x0, cx - .035, x1 - .07): de(MENUIS, xx, xx + .07, RET - .09, RET - .03, b, t, 1)
        for zz in (b, t - .07, t - .62): de(MENUIS, x0, x1, RET - .09, RET - .03, zz, zz + .06, 1)
        # le chambranle (une moulure plate), l'appui sur ses deux consoles, la barre d'appui
        for p0, p1, q0, q1 in cases(x0 - .18, x1 + .18, b, t + .18, [(x0, x1, b, t)]): de(LISSE, p0, p1, -.07, 0, q0, q1)
        de(LISSE, x0 - .3, x1 + .3, -.2, .05, b - .14, b)
        for s in (-1, 1): de(LISSE, cx + s * .52 - .08, cx + s * .52 + .08, -.16, 0, b - .4, b - .14)
        for k in range(11): de(FER, x0 + .03 + k * .123, x0 + .05 + k * .123, -.05, -.03, b, b + .5, 1)
        de(FER, x0 - .03, x1 + .03, -.06, -.02, b + .48, b + .52, 1); de(FER, x0, x1, -.06, -.02, b + .05, b + .08, 1)
        if f == 0 or (f == 1 and abs(cx) < 4.2):   # (au premier étage : une corniche au-dessus)
            de(LISSE, x0 - .32, x1 + .32, -.28, 0, t + .18, t + .3); de(LISSE, x0 - .25, x1 + .25, -.2, 0, t + .3, t + .36)
    # ---- la grande corniche à modillons ----
    de(LISSE, -LARG / 2, LARG / 2, -.12, 0, 21.0, 21.35)
    x = -LARG / 2 + .2
    while x < LARG / 2 - .2: de(LISSE, x, x + .14, -.42, 0, 21.35, 21.6); x += .42
    de(LISSE, -LARG / 2 - .1, LARG / 2 + .1, -.75, 0, 21.6, 21.85); de(LISSE, -LARG / 2 - .15, LARG / 2 + .15, -.8, -.6, 21.85, 22.0)
    de(ZINC, -LARG / 2 - .15, LARG / 2 + .15, -.8, .4, 22.0, 22.05, 1)
    # ---- le toit mansardé (ardoise), ses lucarnes à fronton, ses souches de cheminée ----
    A.prisme(ARDOISE, [(F + .05, HF), (F + 1.8, HF + 3.8), (F + PROF - 1.6, HF + 3.8), (F + PROF + .1, HF)], -LARG / 2, LARG / 2)
    for i, cx in enumerate(COLS):
        de(LISSE, cx - .78, cx + .78, .45, 1.9, HF, HF + 2.45)                                  # (le corps de la lucarne, en pierre)
        de(VITRE if rnd.random() < .6 else RIDEAU, cx - .5, cx + .5, .58, .6, HF + .5, HF + 2.0, 1)
        for p0, p1, q0, q1 in cases(cx - .78, cx + .78, HF, HF + 2.45, [(cx - .5, cx + .5, HF + .5, HF + 2.0)]): de(LISSE, p0, p1, .4, .45, q0, q1)
        for zz in (HF + .5, HF + 1.35, HF + 1.94): de(MENUIS, cx - .5, cx + .5, .55, .58, zz, zz + .06, 1)
        de(MENUIS, cx - .03, cx + .03, .55, .58, HF + .5, HF + 2.0, 1)
        de(LISSE, cx - .9, cx + .9, .3, 1.9, HF + 2.45, HF + 2.6)
        if i % 2 == 0:   # (le fronton triangulaire)
            b = A._b(LISSE); pts = [(cx - .95, HF + 2.6), (cx + .95, HF + 2.6), (cx, HF + 3.25)]
            av = [b.verts.new((x, F + .3, z)) for x, z in pts]; ar = [b.verts.new((x, F + 1.9, z)) for x, z in pts]
            b.faces.new(av); b.faces.new(ar[::-1])
            for k in range(3): b.faces.new((av[k], ar[k], ar[(k + 1) % 3], av[(k + 1) % 3]))
            A._uv(b, av + ar, 1.0)
        else:            # (le fronton cintré, en tranches)
            for k in range(12):
                a0, a1 = -.95 + 1.9 * k / 12, -.95 + 1.9 * (k + 1) / 12; hm = .55 * math.sqrt(max(0, 1 - ((a0 + a1) / 2 / .95) ** 2))
                de(LISSE, cx + a0, cx + a1, .3, 1.9, HF + 2.6, HF + 2.6 + hm + .06)
        de(ZINC, cx - .8, cx + .8, 1.9, 2.6, HF + 2.6, HF + 2.7, 1)
    for cx in (-24, -10, 6, 20):
        de(BRIQUE, cx - .85, cx + .85, 2.0, 2.9, HF + 2.5, HF + 7.0); de(LISSE, cx - .95, cx + .95, 1.92, 2.98, HF + 7.0, HF + 7.2)
        for k in range(4): A.cylindre(POT, .11, .5, cx - .6 + k * .4, F + 2.45, HF + 7.45, n=10)
    return A.objets("rue")
