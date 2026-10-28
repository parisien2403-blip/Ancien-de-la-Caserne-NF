"""La deuxième cour : le dos du bâtiment de l'horloge et le bâtiment d'en face (ses deux façades : deuxième et troisième cour), en vrai relief —
mêmes cotes que toileVerso (matrice.js) : brique rouge, rez-de-chaussée de 5,4 m avec son soubassement blanc de 60 cm, fenêtres de 1,7 × 2,5 m cerclées de
pierre blanche avec leur balconnet noir, portes vitrées, appliques et boîtiers rouges, le passage carré (4,8 × 4,4) au centre.
Repère de Blender : y = -z du jeu. Une façade est décrite par sa ligne y = Yf et son sens (sortant : +1 vers +y, -1 vers -y)."""
from horloge import Atelier, mat, mat_tex
from porche import cases

def cols_par_cote(W, n):
    bord = 2.4; return [-W / 2 + bord + (W - 2 * bord) * (k + .5) / n for k in range(n)]

def facade(A, Yf, sens, W, H, cols, nEt, pasEt, hp=4.4, lp=2.4, portes=True, P=None):
    BRIQUE = mat_tex("nc_brique", "brique", .9, 1.0); PIERRE = mat_tex("nc_pierre", "pierre", .7, .6)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45); FER = mat("nc_fer", (.05, .05, .055), .4, .7)
    ROUGE = mat("nc_rouge", (.55, .16, .1), .55); SOMBRE = mat("nc_sombre", (.12, .11, .1), .9); ZINC = mat("nc_zinc", (.42, .45, .48), .4, .7)
    RET = .25
    def de(m, x0, x1, d0, d1, h0, h1, uv=2.0):   # (d : la profondeur depuis la façade, négatif = en saillie dehors)
        if sens > 0: A.de(m, x0, x1, Yf - d1, Yf - d0, h0, h1, uv)
        else: A.de(m, x0, x1, Yf + d0, Yf + d1, h0, h1, uv)
    rdc = max(5.4, hp + 1)
    fen = [(x - .85, x + .85, 6.15 + e * pasEt, 6.15 + e * pasEt + 2.5) for e in range(nEt) for x in cols if 6.15 + e * pasEt + 2.5 < H - .3]
    dP = (lp + W / 2) / 2 if W >= 40 else 15
    fenR = [(s * (dP + lp + .3) / 2 - .85, s * (dP + lp + .3) / 2 + .85, 2.5, 5.0) for s in (-1, 1)] if W >= 40 else []
    portesX = [d for d in (-dP, dP) if abs(d) + .9 < W / 2 - .5] if portes else []
    ptr = [(d - .9, d + .9, 0, 3.6) for d in portesX]
    trous = fen + fenR + ptr + [(-lp, lp, 0, hp)]
    for x0, x1, h0, h1 in cases(-W / 2, W / 2, 0, H, trous): de(BRIQUE, x0, x1, 0, RET, h0, h1)
    if P:   # (la masse, si on la fait ici — percée du passage)
        for x0, x1, h0, h1 in cases(-W / 2, W / 2, 0, H, [(-lp, lp, 0, hp)]): de(BRIQUE, x0, x1, RET, P, h0, h1)
    for x0, x1, h0, h1 in fen + fenR:
        cx = (x0 + x1) / 2
        de(VITRE, x0, x1, RET - .03, RET, h0, h1, 1)
        de(MENUIS, cx - .04, cx + .04, RET - .09, RET - .03, h0, h1, 1)
        for xx in (x0, x1 - .07): de(MENUIS, xx, xx + .07, RET - .09, RET - .03, h0, h1, 1)
        for hh in (h0, h1 - .07, h1 - .75): de(MENUIS, x0, x1, RET - .09, RET - .03, hh, hh + .07, 1)
        de(PIERRE, x0 - .15, x1 + .15, -.06, 0, h1, h1 + .15); de(PIERRE, x0 - .15, x0, -.06, 0, h0, h1); de(PIERRE, x1, x1 + .15, -.06, 0, h0, h1)
        de(PIERRE, x0 - .22, x1 + .22, -.16, .05, h0 - .12, h0)                                                       # l'appui
        if h0 > 5.5:   # le balconnet noir, devant le bas de la fenêtre
            for k in range(13): de(FER, x0 - .05 + k * .15, x0 - .03 + k * .15, -.12, -.1, h0, h0 + .7, 1)
            de(FER, x0 - .1, x1 + .1, -.13, -.09, h0 + .66, h0 + .71, 1); de(FER, x0 - .1, x1 + .1, -.13, -.09, h0 + .02, h0 + .06, 1)
    for x0, x1, h0, h1 in ptr:   # les portes vitrées sombres
        de(SOMBRE, x0, x1, RET - .03, RET, h0, h1, 1); de(MENUIS, (x0 + x1) / 2 - .05, (x0 + x1) / 2 + .05, RET - .07, RET - .03, h0, h1, 1)
        de(PIERRE, x0 - .15, x1 + .15, -.06, 0, h1, h1 + .15); de(PIERRE, x0 - .15, x0, -.06, 0, h0, h1); de(PIERRE, x1, x1 + .15, -.06, 0, h0, h1)
    # le soubassement blanc (60 cm), sa corniche ; au-dessus du passage, le bandeau blanc et son linteau ; le chéneau, les descentes d'eau
    for x0, x1, h0, h1 in cases(-W / 2, W / 2, 0, .6, ptr + [(-lp, lp, 0, hp)]): de(PIERRE, x0, x1, -.04, 0, h0, h1)
    de(PIERRE, -W / 2, W / 2, -.07, 0, .6, .66)
    de(PIERRE, -lp - .3, lp + .3, -.08, 0, hp, hp + .9); de(PIERRE, -lp - .4, lp + .4, -.14, 0, hp + .86, hp + .96)
    de(ZINC, -W / 2, W / 2, -.25, 0, H - .2, H, 1)
    for x in (-W / 2 + .15, W / 2 - .15): A.cylindre(ZINC, .06, H - .6, x, (Yf - .1 if sens > 0 else Yf + .1) + (sens * .2), (H - .6) / 2 + .3)
    for d in (-4, 4):
        de(SOMBRE, d - .25, d + .25, -.12, 0, rdc - 1.2, rdc - 1.0, 1)                       # l'applique
        de(ROUGE, d - .15, d + .15, -.1, 0, 2.6, 3.0, 1)                                     # le boîtier rouge

# ---- la deuxième cour ----
C2Z0, C2Z1 = -30.0, -44.0          # (jeu)

def envergure_face(bb):
    """le bâtiment d'en face (z de -44 à -56 dans le jeu ; Blender : y de 44 à 56) : le volume, sauf le décor de son passage et les petites choses"""
    xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
    if min(xs) < -22.1 or max(xs) > 22.1 or min(ys) < 43.85 or max(ys) > 56.15 or min(zs) < -.2 or max(zs) > 24.05: return False
    if max(abs(x) for x in xs) <= 2.45 and max(zs) <= 4.5: return False
    if max(max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs)) < .6: return False
    return True

def construire():
    A = Atelier()
    # le dos du bâtiment de l'horloge (face à la deuxième cour) : 44 × 27, quatre colonnes de fenêtres, cinq étages
    pasV = min(150, (1080 - 216 - 30) / 5) / 40
    facade(A, -C2Z0, +1, 44.0, 27.0, [-8.25, -2.75, 2.75, 8.25], 5, pasV)
    # le bâtiment d'en face : 44 × 24, sept colonnes, six étages ; sa façade sur la deuxième cour, et l'autre sur la troisième
    pasF = min(120, (960 - 216 - 30) / 6) / 40; cols = cols_par_cote(44.0, 7)
    facade(A, -C2Z1, -1, 44.0, 24.0, cols, 6, pasF, P=6.0)
    facade(A, -C2Z1 + 12.0, +1, 44.0, 24.0, cols, 6, pasF, P=6.0)
    # (sous le passage du bâtiment d'en face : le plafond)
    PIERRE = mat_tex("nc_pierre", "pierre", .7, .6); A.de(PIERRE, -2.4, 2.4, 44.0, 56.0, 4.4, 4.6)
    return A.objets("verso")
