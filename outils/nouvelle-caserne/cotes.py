"""Les deux bâtiments de plain-pied de la cour d'honneur (à gauche, côté mess ; à droite, côté salle des fêtes), en vrai relief —
mêmes cotes que dans matrice.js (piedToile, la boucle « for (const cote of [-1, 1]) ») :
façade en x = ±12,5 (tournée vers la cour), de z = -18 à z = 8 (dans le jeu), 7 m de haut, 12 m de profondeur
(à droite, au-delà de z = 0,4 : une tranche de 3,5 m seulement — derrière, le vestibule du sous-sol) ;
au bout du fond, les trois garages des cars : des ouvertures carrées (3,8 × 4,8 m), pas des voûtes (la photo) ; ailleurs, les grandes baies vitrées (1,9 × 4,8 m) ;
le toit : en tôle nervurée, à une pente qui descend vers la cour, débordant, avec sa planche de rive blanche et son chéneau ; côté mess, un auvent au-dessus des garages.
Les cars dans les garages, les marches, la corniche et les trottoirs de 1990 sont gardés tels quels.
Repère de Blender : x identique, y = -z (jeu), z = hauteur."""
import math
from mathutils import Matrix
from horloge import Atelier, mat, mat_tex

LONG, HPP, PROF, VOUTES = 32, 7.0, 12.0, [-14.4, -9.8, -5.2]
FX, RET, HE = 12.5, .25, 6.0

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
        if z1 < .75 or z0 < -.2 or z1 > 7.65: return False                       # (les marches, les trottoirs)
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
    TOLE = mat_tex("nc_tole", "tole", .45, 1.0); ZINC = mat("nc_zinc", (.42, .45, .48), .4, .7); BLANC = mat("nc_blanc", (.92, .91, .88), .6); FER = mat("nc_fer", (.05, .05, .055), .4, .7)
    objs = []
    for cote in (-1, 1):
        A = Atelier(); roof = []; auvent = []
        # on construit dans le repère de la façade : u = z du jeu (le long), d = la profondeur (0 = la façade, vers l'intérieur), h = la hauteur
        loc = []   # (les volumes, notés en (u0, u1, d0, d1, h0, h1) ; transformés à la fin)
        def bloc(m, u0, u1, d0, d1, h0, h1, uv=2.0): loc.append((m, u0, u1, d0, d1, h0, h1, uv))
        fin = 8.0; z0 = -18.0
        gar = [(VZ - 1.9, VZ + 1.9) for VZ in VOUTES]; bz = baies(cote)
        trous = [(a, b, 0, 4.8) for a, b in gar] + [(z - .95, z + .95, .6, 5.45) for z in bz]
        # la façade percée (d de 0 à RET), découpée en cases autour des ouvertures
        us = sorted({z0, fin, *[t[0] for t in trous], *[t[1] for t in trous]}); hs = sorted({0, HE, *[t[2] for t in trous], *[t[3] for t in trous]})
        for i in range(len(us) - 1):
            for j in range(len(hs) - 1):
                cu, ch = (us[i] + us[i + 1]) / 2, (hs[j] + hs[j + 1]) / 2
                if any(t[0] < cu < t[1] and t[2] < ch < t[3] for t in trous): continue
                bloc(SOCLEM, us[i], us[i + 1], 0, RET, hs[j], hs[j + 1])
        # les garages : des ouvertures carrées, leur linteau de pierre, leurs piédroits
        for a, b in gar:
            bloc(PIERRE, a - .25, b + .25, -.1, RET, 4.8, 5.3)
            for s in (-1, 1): bloc(PIERRE, (a if s < 0 else b) - .25 * (s < 0), (a if s < 0 else b) + .25 * (s > 0), -.1, RET, 0, 4.8)
        # la masse du bâtiment derrière la façade (creusée par les garages)
        prof = lambda u: PROF if (cote < 0 or u <= .4) else 3.5
        segs = sorted({z0, fin, .4, *[g for ab in gar for g in ab]})
        for i in range(len(segs) - 1):
            a, b = segs[i], segs[i + 1]; m = (a + b) / 2; P = prof(m)
            if any(g0 <= m <= g1 for g0, g1 in gar): bloc(SOCLEM, a, b, RET, P, 4.8, HE); continue
            bloc(SOCLEM, a, b, RET, P, 0, HE)
        # les grandes baies vitrées : la vitre en retrait, trois vantaux, une traverse, l'appui et le linteau de pierre, une applique au-dessus
        for z in bz:
            bloc(VITRE, z - .95, z + .95, RET - .03, RET, .6, 5.45, 1)
            for du in (-.95, -.31, .31, .95): bloc(MENUIS, z + du - .04, z + du + .04, RET - .09, RET - .03, .6, 5.45, 1)
            for hh in (.6, 1.4, 4.1, 5.38): bloc(MENUIS, z - .95, z + .95, RET - .09, RET - .03, hh, hh + .07, 1)
            bloc(PIERRE, z - 1.1, z + 1.1, -.12, .1, 5.45, 5.7); bloc(PIERRE, z - 1.05, z + 1.05, -.15, .1, .5, .6)
        # le haut du mur : un bandeau de pierre ; le toit en tôle, à une pente (il monte vers le fond), débordant de 60 cm ;
        # sa planche de rive blanche, son chéneau de zinc (et ses pignons, maçonnés, aux deux bouts)
        bloc(PIERRE, z0, fin, -.1, .05, HE - .22, HE)
        pente = .27
        for i in range(len(segs) - 1):
            a, b = segs[i], segs[i + 1]; P = prof((a + b) / 2)
            roof.append((a, b, P))
        bloc(BLANC, z0 - .6, fin + .6, -.68, -.6, HE - .35, HE + .05)
        for k in range(60): bloc(ZINC, z0 - .6 + k * (fin - z0 + 1.2) / 60, z0 - .6 + (k + 1) * (fin - z0 + 1.2) / 60, -.82, -.68, HE - .3, HE - .18, 1)
        if cote < 0:   # (l'auvent au-dessus des garages, côté mess)
            g0, g1 = min(g[0] for g in gar) - .4, max(g[1] for g in gar) + .4
            auvent.append((g0, g1))
            for u in (g0 + .2, (g0 + g1) / 2, g1 - .2): bloc(FER, u - .04, u + .04, -1.9, 0, 5.4, 5.48, 1)
        # ---- dans le repère de Blender : x = cote × (12,5 + d), y = -u ----
        for m, u0, u1, d0, d1, h0, h1, uv in loc:
            x0, x1 = sorted((cote * (FX + d0), cote * (FX + d1)))
            A.de(m, x0, x1, -u1, -u0, h0, h1, uv)
        # le toit : un plan incliné par tranche (de la rive, à -0,6 m, à HE ; jusqu'au fond, plus haut)
        for a, b, P in roof:
            x0, x1 = cote * (FX - .6), cote * (FX + P)
            prof_ = [(x0, HE), (x1, HE + (P + .6) * .27), (x1, HE + (P + .6) * .27 + .12), (x0, HE + .12)]
            bm = A._b(TOLE); vs = [bm.verts.new((x, -u, z)) for u in (a, b) for x, z in prof_]
            for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
                try: bm.faces.new([vs[i] for i in f])
                except ValueError: pass
            A._uv(bm, vs, 2.0)
            for u in (a, b):   # (les pignons : le mur, sous la pente)
                bm2 = A._b(SOCLEM); ws = [bm2.verts.new((cote * x, -u, z)) for x, z in ((FX, HE), (FX + P, HE), (FX + P, HE + (P + .6) * .27), (FX, HE + .6 * .27))]
                bm2.faces.new(ws); A._uv(bm2, ws, 2.0)
        for g0, g1 in auvent:
            x0, x1 = cote * FX, cote * (FX - 2.0)
            bm = A._b(TOLE); vs = [bm.verts.new((x, -u, z)) for u in (g0, g1) for x, z in ((x0, 5.55), (x1, 5.1), (x1, 5.18), (x0, 5.63))]
            for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
                try: bm.faces.new([vs[i] for i in f])
                except ValueError: pass
            A._uv(bm, vs, 2.0)
        objs += A.objets("cote%+d" % cote)
    return objs
