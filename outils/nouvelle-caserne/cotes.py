"""Les deux bâtiments de plain-pied de la cour d'honneur (à gauche, côté mess ; à droite, côté salle des fêtes), en vrai relief —
mêmes cotes que dans matrice.js (piedToile, la boucle « for (const cote of [-1, 1]) ») :
façade en x = ±12,5 (tournée vers la cour), de z = -18 à z = 8 (dans le jeu), 7 m de haut, 12 m de profondeur
(à droite, au-delà de z = 0,4 : une tranche de 3,5 m seulement — derrière, le vestibule du sous-sol) ;
au bout du fond, trois voûtes de garage (3,8 m de large, 4,8 m sous la clé) ; ailleurs, les grandes baies vitrées (1,9 × 4,8 m).
Les cars dans les garages, les marches, la corniche et les trottoirs de 1990 sont gardés tels quels.
Repère de Blender : x identique, y = -z (jeu), z = hauteur."""
import math
from mathutils import Matrix
from horloge import Atelier, mat, mat_tex

LONG, HPP, PROF, VOUTES = 32, 7.0, 12.0, [-14.4, -9.8, -5.2]
FX, RET = 12.5, .25

def baies(cote):
    """les centres (z du jeu) des grandes baies vitrées, comme la toile de 1990"""
    us = [(VZ + 2) if cote > 0 else -(VZ + 2) for VZ in VOUTES]; out = []
    for i in range(11):
        X = 40 + i * 142; u = (X + 50) / 50 - 16
        if any(abs(u - v) < 3 for v in us): continue
        z = (u - 2) if cote > 0 else (-u - 2)
        if -17.5 < z < 7.2: out.append(z)
    return out

def envergure(cote):
    """la zone à vider dans l'export de 1990 (repère de Blender) : le volume du bâtiment, sauf les garages (les cars y restent)"""
    def dedans(bb):
        xs = [abs(v.x) for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
        if any((v.x > 0) != (cote > 0) for v in bb): return False
        x0, x1, y0, y1, z0, z1 = min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)
        if z1 < .75 or z0 < -.2 or z1 > 7.05: return False                       # (les marches, les trottoirs ; la corniche, au-dessus)
        if x0 < 12.3 or y0 < -8.05 or y1 > 18.05: return False
        if cote > 0 and y0 < -.45 and x1 > 16.05: return False                   # (à droite, au-delà de z = 0,4 : le vestibule, derrière)
        if x1 > 24.6: return False
        for VZ in VOUTES:                                                        # (les cars et le fond de chaque garage)
            if abs((y0 + y1) / 2 + VZ) < 1.95 and x0 > 12.55 and z1 < 4.9: return False
        return True
    return dedans

def construire():
    SOCLEM = mat_tex("nc_socle", "socle", .85, 1.2); PIERRE = mat_tex("nc_pierre", "pierre", .7, .6)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45); SOMBRE = mat("nc_sombre", (.12, .11, .1), .9); TOIT = mat("nc_toit", (.56, .54, .5), .85)
    objs = []
    for cote in (-1, 1):
        A = Atelier()
        # on construit dans le repère de la façade : u = z du jeu (le long), d = la profondeur (0 = la façade, vers l'intérieur), h = la hauteur
        loc = []   # (les volumes, notés en (u0, u1, d0, d1, h0, h1) ; transformés à la fin)
        def bloc(m, u0, u1, d0, d1, h0, h1, uv=2.0): loc.append((m, u0, u1, d0, d1, h0, h1, uv))
        fin = 8.0; z0 = -18.0
        gar = [(VZ - 1.9, VZ + 1.9) for VZ in VOUTES]; bz = baies(cote)
        trous = [(a, b, 0, 4.8) for a, b in gar] + [(z - .95, z + .95, .6, 5.45) for z in bz]
        # la façade percée (d de 0 à RET), découpée en cases autour des ouvertures
        us = sorted({z0, fin, *[t[0] for t in trous], *[t[1] for t in trous]}); hs = sorted({0, HPP, *[t[2] for t in trous], *[t[3] for t in trous]})
        for i in range(len(us) - 1):
            for j in range(len(hs) - 1):
                cu, ch = (us[i] + us[i + 1]) / 2, (hs[j] + hs[j + 1]) / 2
                if any(t[0] < cu < t[1] and t[2] < ch < t[3] for t in trous): continue
                bloc(SOCLEM, us[i], us[i + 1], 0, RET, hs[j], hs[j + 1])
        # le haut de l'arc des voûtes : la pierre qui remplit les coins au-dessus du demi-cercle (en marches fines)
        for a, b in gar:
            c = (a + b) / 2; n = 28
            for k in range(n):
                t0 = -1.9 + 3.8 * k / n; t1 = t0 + 3.8 / n; tm = (t0 + t1) / 2
                hh = 2.9 + math.sqrt(max(0, 1.9 ** 2 - tm ** 2))
                bloc(SOCLEM, c + t0, c + t1, 0, RET, hh, 4.8)
                bloc(PIERRE, c + t0, c + t1, -.06, 0, hh, min(4.8, hh + .22))            # l'archivolte : un bandeau de pierre claire qui suit l'arc
            for s in (-1, 1): bloc(PIERRE, c + s * 1.9 - (.22 if s > 0 else 0), c + s * 1.9 + (0 if s > 0 else .22), -.06, 0, 0, 2.9)
            bloc(PIERRE, c - .2, c + .2, -.12, 0, 4.45, 5.0)                                # la clé
        # la masse du bâtiment derrière la façade (creusée par les garages)
        prof = lambda u: PROF if (cote < 0 or u <= .4) else 3.5
        segs = sorted({z0, fin, .4, *[g for ab in gar for g in ab]})
        for i in range(len(segs) - 1):
            a, b = segs[i], segs[i + 1]; m = (a + b) / 2; P = prof(m)
            if any(g0 <= m <= g1 for g0, g1 in gar): bloc(SOCLEM, a, b, RET, P, 4.8, HPP - .05); continue
            bloc(SOCLEM, a, b, RET, P, 0, HPP - .05)
        # les grandes baies vitrées : la vitre en retrait, trois vantaux, une traverse, l'appui et le linteau de pierre, une applique au-dessus
        for z in bz:
            bloc(VITRE, z - .95, z + .95, RET - .03, RET, .6, 5.45, 1)
            for du in (-.95, -.31, .31, .95): bloc(MENUIS, z + du - .04, z + du + .04, RET - .09, RET - .03, .6, 5.45, 1)
            for hh in (.6, 1.4, 4.1, 5.38): bloc(MENUIS, z - .95, z + .95, RET - .09, RET - .03, hh, hh + .07, 1)
            bloc(PIERRE, z - 1.1, z + 1.1, -.12, .1, 5.45, 5.7); bloc(PIERRE, z - 1.05, z + 1.05, -.15, .1, .5, .6)
            bloc(SOMBRE, z - .55, z - .15, -.12, 0, 5.85, 6.0, 1)                           # l'applique (le petit boîtier sombre de la toile)
        # le bandeau du haut (l'entablement), et un cordon à mi-hauteur
        bloc(PIERRE, z0, fin, -.1, .05, 6.2, 6.95); bloc(PIERRE, z0, fin, -.05, .02, 6.95, 7.0)
        # le toit (terrasse)
        for i in range(len(segs) - 1):
            a, b = segs[i], segs[i + 1]; bloc(TOIT, a, b, RET, prof((a + b) / 2), HPP - .05, HPP)
        # ---- dans le repère de Blender : x = cote × (12,5 + d), y = -u ----
        for m, u0, u1, d0, d1, h0, h1, uv in loc:
            x0, x1 = sorted((cote * (FX + d0), cote * (FX + d1)))
            A.de(m, x0, x1, -u1, -u0, h0, h1, uv)
        objs += A.objets("cote%+d" % cote)
    return objs
