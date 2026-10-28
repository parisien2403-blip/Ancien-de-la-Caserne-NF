"""La place au bout de la rue en pente, et son pan coupé : la voûte sous l'horloge jaune (l'horloge octogonale), en vrai relief —
d'après la photo et aux mêmes cotes que matrice.js (construireRue… le pan coupé : 8,22 m de large, 24 m de haut, 8 m de profondeur,
posé à 45° au coin de la place, au pied 1,30 m plus bas que la cour ; la voûte en plein cintre de 4,6 m, 5,6 m sous la clé ;
le bandeau blanc à 7,7 m ; au-dessus, le renfoncement de 5,4 × 1,5 m où se tient le pavillon blanc de l'horloge, entre ses deux balcons à balustres).
Refaits ici : la façade de brique et sa voûte (le rouleau de briques en arc, le berceau du passage), le soubassement blanc, les chaînes d'angle,
les bandeaux ; le fond du renfoncement (la colonne blanche au-dessus de l'horloge, les portes-fenêtres sur les balcons, les fenêtres des étages)
et ses deux retours. Gardés de 1990 (déjà en volume) : le bandeau, le pavillon et son toit, le cadran, les balcons, les projecteurs, le portail, le pavé.
Repère local : u en travers, v vers l'intérieur (la façade en v = 0, tournée vers -v, vers la place), w la hauteur ; posé dans la carte par place()."""
import math
from mathutils import Matrix, Vector
from horloge import Atelier, mat, mat_tex
from porche import cases

CX, CY, ANG = 27.2, 131.2, -math.pi / 4
W, H, P, AW, AH, W0 = 8.22, 24.0, 8.0, 4.6, 5.6, -1.3
R = AW / 2; ZN = W0 + AH - R; YT = W0 + AH + 2.1; RW, RD = 5.4, 1.5; RET = .3
M = Matrix.Translation((CX, CY, 0)) @ Matrix.Rotation(ANG, 4, "Z")
MI = M.inverted()

def local(o):
    vs = [MI @ v.co for v in o.data.vertices]
    return [min(v.x for v in vs), max(v.x for v in vs), min(v.y for v in vs), max(v.y for v in vs), min(v.z for v in vs), max(v.z for v in vs)]

def envergure(o):
    """la façade de 1990 du pan coupé (un volume extrudé peint) et les deux toiles du renfoncement : grands, hauts, dans le pan coupé"""
    b = local(o)
    if b[0] < -W / 2 - .3 or b[1] > W / 2 + .3 or b[2] < -.8 or b[3] > P + .3: return False
    return b[5] - b[4] > 10 and max(b[1] - b[0], b[3] - b[2]) > 1.2

def construire():
    BRIQUE = mat_tex("nc_brique", "brique", .9, 1.0); PIERRE = mat_tex("nc_pierre", "pierre", .7, .6)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); RIDEAU = mat("nc_rideau", (.86, .84, .78), .9); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45)
    VOUTE = mat("nc_voute", (.42, .26, .2), .95); ARC = mat("nc_brique_arc", (.45, .2, .14), .85); OR = mat("nc_or", (.8, .6, .25), .35, .6)
    A = Atelier()
    def de(m, u0, u1, v0, v1, w0, w1, uv=2.0): A.de(m, u0, u1, v0, v1, w0, w1, uv)
    # ---- la façade : la peau de brique percée de la voûte (en tranches pour le cintre) et du renfoncement ; la masse derrière ----
    voute = [(-R, R, W0, ZN)] + [(-R * math.sqrt(max(0, 1 - ((k + .5) / 16) ** 2)), R * math.sqrt(max(0, 1 - ((k + .5) / 16) ** 2)), ZN + R * k / 16, ZN + R * (k + 1) / 16) for k in range(16)]
    renf = (-RW / 2, RW / 2, YT, W0 + H)
    for u0, u1, w0, w1 in cases(-W / 2, W / 2, W0, W0 + H, voute + [renf]): de(BRIQUE, u0, u1, 0, RET, w0, w1)
    for u0, u1, w0, w1 in cases(-W / 2, W / 2, W0, W0 + H, voute + [renf]): de(BRIQUE, u0, u1, RET, P, w0, w1)
    for u0, u1, w0, w1 in cases(-RW / 2, RW / 2, YT, W0 + H, []): de(BRIQUE, u0, u1, RD + RET, P, w0, w1)
    # le berceau du passage (lisse, en briques sombres), le rouleau de briques en arc autour, le soubassement blanc
    n = 32
    for k in range(n):
        a0, a1 = math.pi * k / n, math.pi * (k + 1) / n; am = (a0 + a1) / 2
        A.boite(VOUTE, R * (a1 - a0) + .02, P, .3, -(R + .15) * math.cos(am), P / 2, ZN + (R + .15) * math.sin(am), rot=Matrix.Rotation(-(math.pi / 2 - am), 3, "Y"), uv=2.0)
        A.boite(ARC, R * (a1 - a0) * 1.15 - .025, .12, .48, -(R + .24) * math.cos(am), -.05, ZN + (R + .24) * math.sin(am), rot=Matrix.Rotation(-(math.pi / 2 - am), 3, "Y"), uv=1.0)
    for s in (-1, 1): de(PIERRE, s * R - (.0 if s < 0 else .0) - (.06 if s > 0 else 0), s * R + (.06 if s < 0 else 0), 0, P, W0, ZN)   # (les piédroits, enduits)
    for u0, u1, w0, w1 in cases(-W / 2, W / 2, W0, W0 + 1.2, [(-R, R, W0, W0 + 1.2)]): de(PIERRE, u0, u1, -.05, 0, w0, w1)
    de(PIERRE, -W / 2, W / 2, -.08, 0, W0 + 1.2, W0 + 1.28)
    # les bandeaux blancs (sur les deux montants de part et d'autre du renfoncement), les chaînes d'angle en pierre blanche
    for hb in (10.2, 16.0):
        for s in (-1, 1): de(PIERRE, min(s * RW / 2, s * W / 2), max(s * RW / 2, s * W / 2), -.07, 0, W0 + hb, W0 + hb + .45)
    for s in (-1, 1):
        w = W0 + 1.28; k = 0
        while w < W0 + H - .1:
            l = .5 if k % 2 else .32; w1 = min(w + .5, W0 + H)
            for u in (s * W / 2, s * RW / 2):
                if u == s * RW / 2 and w < YT: continue
                a, b = (u - l, u) if s > 0 else (u, u + l)
                if u == s * RW / 2: a, b = (u, u + l) if s > 0 else (u - l, u)
                de(PIERRE, a, b, -.05, 0 if u == s * W / 2 else 0, w + .02, w1 - .02)
            w = w1; k += 1
    # ---- le renfoncement : le fond (v = 1,5) et ses deux retours ----
    def fenetre(u, v, larg, b, h, porte=False):
        """une fenêtre dans le fond (vue de -v) : l'encadrement blanc, la vitre, le meneau, la traverse, l'appui"""
        de(RIDEAU if (int(u * 7 + b) % 3 == 0) else VITRE, u - larg / 2, u + larg / 2, v + RET - .03, v + RET, b, b + h, 1)
        for p0, p1, q0, q1 in cases(u - larg / 2 - .2, u + larg / 2 + .2, b, b + h + .2, [(u - larg / 2, u + larg / 2, b, b + h)]): de(PIERRE, p0, p1, v - .05, v, q0, q1)
        de(MENUIS, u - .035, u + .035, v + RET - .09, v + RET - .03, b, b + h, 1); de(MENUIS, u - larg / 2, u + larg / 2, v + RET - .09, v + RET - .03, b + h * (.25 if porte else .62), b + h * (.25 if porte else .62) + .05, 1)
        if not porte: de(PIERRE, u - larg / 2 - .25, u + larg / 2 + .25, v - .14, v + .05, b - .1, b)
    trousF = []
    for e in range(5):
        for s in (-1, 1):
            b = YT + (.15 if e == 0 else e * 3 + 1.2); h = 2.3 if e == 0 else 2.1
            trousF.append((s * 1.75 - .65, s * 1.75 + .65, b, b + h, e == 0))
        if e: trousF.append((-.55, .55, YT + e * 3 + 1.2, YT + e * 3 + 3.3, False))
    for u0, u1, w0, w1 in cases(-RW / 2, RW / 2, YT, W0 + H, [t[:4] for t in trousF]): de(BRIQUE, u0, u1, RD, RD + RET, w0, w1)
    for u0, u1, b, t, porte in trousF: fenetre((u0 + u1) / 2, RD, u1 - u0, b, t - b, porte)
    for u0, u1, w0, w1 in cases(-.85, .85, YT + 2.2, W0 + H, [t[:4] for t in trousF if abs(t[0] + t[1]) < .1]): de(PIERRE, u0, u1, RD - .06, RD, w0, w1)   # (la colonne blanche)
    for s in (-1, 1):
        # (le retour : un mur de brique de v = 0 à 1,5, tourné vers le milieu ; sa chaîne de pierre au bord ; une petite fenêtre par étage)
        u = s * RW / 2; tr = [(.4, 1.1, YT + e * 3 + 1.2, YT + e * 3 + 3.3) for e in range(1, 5)]
        for v0, v1, w0, w1 in cases(0, RD, YT, W0 + H, tr):
            a, b = (u, u + RET) if s > 0 else (u - RET, u); de(BRIQUE, a, b, v0, v1, w0, w1)
        for v0, v1, w0, w1 in tr:
            a, b = (u + RET - .03, u + RET) if s > 0 else (u - RET, u - RET + .03); de(VITRE, a, b, v0, v1, w0, w1, 1)
            for p0, p1, q0, q1 in cases(v0 - .15, v1 + .15, w0, w1 + .15, [(v0, v1, w0, w1)]):
                a, b = (u - .05, u) if s > 0 else (u, u + .05); de(PIERRE, a, b, p0, p1, q0, q1)
    # (autour du cadran de 1990 : un cadre octogonal doré, en relief)
    zc = YT + 2.18 / 2; rc = 1.06
    for i in range(8):
        a = math.pi / 8 + i * math.pi / 4; c = (rc * math.cos(a + math.pi / 8), zc + rc * math.sin(a + math.pi / 8))
        A.boite(OR, 2 * rc * math.sin(math.pi / 8) + .05, .05, .07, c[0], -.37, c[1], rot=Matrix.Rotation(-(a + math.pi / 8 - math.pi / 2), 3, "Y"), uv=1)
    objs = A.objets("horloge_jaune")
    for o in objs: o.data.transform(M)
    return objs
