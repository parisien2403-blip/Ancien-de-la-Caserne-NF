"""La façade du porche, côté cour (le bâtiment par lequel on arrive de la rue), et les deux hautes ailes en brique (R et S) —
mêmes cotes que dans matrice.js (face2, facadePercee ZF = 15,5, toileAile, toileCote) :
façade : x de -12,5 à 12,5, devant en z = 15,5 (jeu), 14 m de profondeur, 20,2 m de haut ; socle de pierre de 4,6 m (le passage 4,8 × 4,4,
deux baies), cinq étages de brique (fenêtres de 1,45 × 1,75 cerclées de pierre blanche), corniche blanche. Le toit mansardé de 1990 est gardé.
ailes : x de ±8,6 à ±16,5, z de 12 à 26, 26 m de haut ; socle de pierre de 4,6 m ; sur leur face intérieure, la porte (R ou S) et la colonne de petites
fenêtres de l'escalier au-dessus ; sur la face de gauche tournée vers la cour, une fenêtre.
Repère de Blender : x identique, y = -z (jeu), z = hauteur."""
from horloge import Atelier, mat, mat_tex, mur_perce

ZF, LF, HSOC, HB, PF2 = 15.5, 25.0, 4.6, 20.2, 14.0
C5 = [-6.4, -3.2, 0, 3.2, 6.4]; CF = [-LF / 2 + (k + .5) * LF / 8 for k in range(8)]
AX0, AX1, AZ0, AZ1, AH = 8.6, 16.5, 12.0, 26.0, 26.0

def envergure_porche(bb):
    xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
    if min(xs) < -12.65 or max(xs) > 12.65 or min(ys) < -29.65 or max(ys) > -15.25 or min(zs) < -.2 or max(zs) > HB + .05: return False
    if max(abs(x) for x in xs) <= 2.45 and max(zs) <= 4.45: return False          # (le décor du passage, sous la voûte : gardé)
    return True

def envergure_aile(cote):
    def f(bb):
        xs = [v.x * cote for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
        if min(xs) < AX0 - .1 or max(xs) > AX1 + .1 or min(ys) < -AZ1 - .1 or max(ys) > -AZ0 + .1 or min(zs) < -.2 or max(zs) > AH + .1: return False
        dims = (max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs))
        if max(dims) < .6: return False                                              # (la plaque R / S, les petites choses : gardées)
        return True
    return f

def construire():
    BRIQUE = mat_tex("nc_brique", "brique", .9, 1.0); SOCLEM = mat_tex("nc_socle", "socle", .85, 1.2); PIERRE = mat_tex("nc_pierre", "pierre", .7, .6)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45); FER = mat("nc_fer", (.05, .05, .055), .4, .7)
    ZINC = mat("nc_zinc", (.42, .45, .48), .4, .7); TOIT = mat("nc_toit", (.56, .54, .5), .85); SOMBRE = mat("nc_sombre", (.12, .11, .1), .9)
    ESC = mat("nc_cage", (.62, .56, .46), .9); ROUGE = mat("nc_rouge", (.55, .16, .1), .55)
    A = Atelier(); RET = .25
    # ===== la façade du porche : on la décrit en (x, h) ; le devant est en y = -ZF, l'intérieur vers -y =====
    yF = -ZF
    def de(m, x0, x1, d0, d1, h0, h1, uv=2.0): A.de(m, x0, x1, yF - d1, yF - d0, h0, h1, uv)   # (d : la profondeur depuis la façade ; négatif = en saillie vers la cour)
    # le socle : percé du passage et de deux baies
    baies = [(CF[2], 1.7), (CF[5], 1.7)]
    trous = [(-2.4, 2.4, 0, 4.4)] + [(x - l / 2, x + l / 2, .9, 3.15) for x, l in baies]
    for i, (x0, x1, h0, h1) in enumerate(cases(-LF / 2, LF / 2, 0, HSOC, trous)): de(SOCLEM, x0, x1, 0, RET, h0, h1)
    for x0, x1, h0, h1 in cases(-LF / 2, LF / 2, 0, HSOC, [(-2.4, 2.4, 0, 4.4)]): de(SOMBRE, x0, x1, RET, PF2, h0, h1)
    for x, l in baies:
        de(VITRE, x - l / 2, x + l / 2, RET - .03, RET, .9, 3.15, 1)
        for xx in (x - l / 2, x - .035, x + l / 2 - .07): de(MENUIS, xx, xx + .07, RET - .09, RET - .03, .9, 3.15, 1)
        for hh in (.9, 2.3, 3.08): de(MENUIS, x - l / 2, x + l / 2, RET - .09, RET - .03, hh, hh + .07, 1)
        de(PIERRE, x - l / 2 - .18, x + l / 2 + .18, -.1, .05, 3.15, 3.45); de(PIERRE, x - l / 2 - .1, x + l / 2 + .1, -.18, .05, .8, .9)
        de(SOMBRE, x - .15, x + .15, -.12, 0, 3.6, 3.75, 1)                                   # l'applique
    de(PIERRE, -2.7, 2.7, -.2, .05, 4.15, 4.6)                                                # le linteau du porche
    de(PIERRE, -2.15, -1.65, -.16, 0, 4.62, 5.35)                                             # l'emblème sculpté (le médaillon)
    de(PIERRE, -LF / 2 - .1, LF / 2 + .1, -.3, .05, HSOC - .05, HSOC + .25); de(PIERRE, -LF / 2 - .05, LF / 2 + .05, -.22, 0, HSOC - .17, HSOC - .05)
    # les cinq étages de brique : 25 fenêtres cerclées de pierre blanche
    fen = [(cx - .72, cx + .73, HSOC + .55 + f * 3, HSOC + .55 + f * 3 + 1.75) for f in range(5) for cx in C5]
    for x0, x1, h0, h1 in cases(-LF / 2, LF / 2, HSOC + .25, HB, fen): de(BRIQUE, x0, x1, 0, RET, h0, h1)
    de(BRIQUE, -LF / 2, LF / 2, RET, PF2, HSOC, HB)
    for x0, x1, h0, h1 in fen:
        cx = (x0 + x1) / 2
        de(VITRE, x0, x1, RET - .03, RET, h0, h1, 1)
        de(MENUIS, cx - .035, cx + .035, RET - .09, RET - .03, h0, h1, 1); de(MENUIS, x0, x1, RET - .09, RET - .03, h1 - .68, h1 - .62, 1)
        for xx in (x0, x1 - .07): de(MENUIS, xx, xx + .07, RET - .09, RET - .03, h0, h1, 1)
        for hh in (h0, h1 - .07): de(MENUIS, x0, x1, RET - .09, RET - .03, hh, hh + .07, 1)
        # l'encadrement de pierre blanche (25 cm), l'appui saillant
        de(PIERRE, x0 - .25, x1 + .25, -.06, 0, h1, h1 + .25); de(PIERRE, x0 - .25, x0, -.06, 0, h0, h1); de(PIERRE, x1, x1 + .25, -.06, 0, h0, h1)
        de(PIERRE, x0 - .35, x1 + .35, -.2, .05, h0 - .15, h0)
        for k in range(10): de(FER, x0 + .07 + k * .145, x0 + .09 + k * .145, -.04, -.02, h0, h0 + .42, 1)   # la barre d'appui
        de(FER, x0, x1, -.05, -.01, h0 + .38, h0 + .42, 1)
    # la corniche blanche, les descentes d'eau
    de(PIERRE, -LF / 2 - .2, LF / 2 + .2, -.45, .05, HB - .45, HB); de(PIERRE, -LF / 2 - .1, LF / 2 + .1, -.25, 0, HB - .62, HB - .45)
    for x in (-LF / 2 + .15, LF / 2 - .15): A.cylindre(ZINC, .06, HB - HSOC - .8, x, yF + .1, HSOC + .25 + (HB - HSOC - .8) / 2)
    # ===== les deux ailes en brique =====
    for cote in (-1, 1):
        sx = lambda a: cote * a
        def ad(m, xa, xb, za, zb, h0, h1, uv=2.0):   # (xa, xb : distance au milieu de la cour ; za, zb : z du jeu)
            x0, x1 = sorted((sx(xa), sx(xb))); A.de(m, x0, x1, -zb, -za, h0, h1, uv)
        # la masse : socle de pierre puis brique ; on creuse la porte de l'escalier, sur la face intérieure (x = ±8,6), en z = 13,75
        zP0, zP1 = 13.75 - .7, 13.75 + .7
        for z0, z1, h0, h1 in cases(AZ0, AZ1, 0, HSOC, [(zP0, zP1, 0, 2.88)]): ad(SOCLEM, AX0, AX0 + .65, z0, z1, h0, h1)
        ad(BRIQUE, AX0, AX0 + .65, AZ0, AZ1, HSOC, AH)
        ad(SOCLEM, AX0 + .65, AX1, AZ0, AZ1, 0, HSOC); ad(BRIQUE, AX0 + .65, AX1, AZ0, AZ1, HSOC, AH)
        # la cage d'escalier, par la porte qui a sauté : murs beiges, quelques marches, une ampoule
        ad(ESC, AX0 + .65, AX0 + 3.0, zP0, zP1, 0, .02); ad(ESC, AX0 + 3.0, AX0 + 3.1, zP0, zP1, 0, 2.88); ad(ESC, AX0 + .65, AX0 + 3.0, zP0, zP1, 2.86, 2.88)
        for k in range(6): ad(ESC, AX0 + 1.6 + k * .23, AX0 + 3.0, zP0 + .05, zP1 - .05, 0, .17 * (k + 1))
        ad(PIERRE, AX0 - .08, AX0, zP0 - .22, zP1 + .22, 0, 3.1)                                  # l'encadrement de la porte
        # au-dessus : la bande blanche et la colonne de petites fenêtres de l'escalier, jusqu'en haut
        ad(PIERRE, AX0 - .05, AX0, 13.75 - .55, 13.75 + .55, 5.0, AH - 1.5)
        h = 5.15
        while h < AH - 2.0:
            ad(VITRE, AX0 - .07, AX0 - .05, 13.75 - .4, 13.75 + .4, h, h + .42, 1); h += .55
        ad(SOMBRE, AX0 - .1, AX0, 13.75 - .15, 13.75 + .15, 3.45, 3.6, 1)                         # l'applique au-dessus de la porte
        # le socle : son bandeau ; la corniche du haut ; le toit
        ad(PIERRE, AX0 - .2, AX1, AZ0 - .2, AZ1, HSOC - .05, HSOC + .2)
        ad(PIERRE, AX0 - .3, AX1 + .1, AZ0 - .3, AZ1 + .1, AH - .35, AH)
        ad(TOIT, AX0, AX1, AZ0, AZ1, AH, AH + .05)
        # sur la face tournée vers la cour (z = 12) — l'aile de gauche seulement : une fenêtre, centrée sur la partie visible
        if cote < 0:
            xc = (AX0 + 12.5) / 2
            ad(SOMBRE, xc - .85, xc + .85, AZ0 - .02, AZ0 + .2, .95, 3.15)
            ad(VITRE, xc - .85, xc + .85, AZ0 + .17, AZ0 + .2, .95, 3.15, 1)
            ad(MENUIS, xc - .04, xc + .04, AZ0 + .1, AZ0 + .17, .95, 3.15, 1); ad(MENUIS, xc - .85, xc + .85, AZ0 + .1, AZ0 + .17, 1.85, 1.92, 1)
            ad(PIERRE, xc - 1.02, xc + 1.02, AZ0 - .12, AZ0 + .05, 3.15, 3.35); ad(PIERRE, xc - 1.0, xc + 1.0, AZ0 - .18, AZ0 + .05, .85, .95)
    return A.objets("porche")

def cases(a0, a1, h0, h1, trous):
    """les cases d'un pan de mur (a de a0 à a1, h de h0 à h1) sans les trous [a0, a1, h0, h1]"""
    xs = sorted({a0, a1, *[t[0] for t in trous], *[t[1] for t in trous]}); zs = sorted({h0, h1, *[t[2] for t in trous], *[t[3] for t in trous]})
    xs = [x for x in xs if a0 <= x <= a1]; zs = [z for z in zs if h0 <= z <= h1]; out = []
    for i in range(len(xs) - 1):
        for j in range(len(zs) - 1):
            cx, cz = (xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2
            if any(t[0] < cx < t[1] and t[2] < cz < t[3] for t in trous): continue
            out.append((xs[i], xs[i + 1], zs[j], zs[j + 1]))
    return out
