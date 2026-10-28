"""L'entrée de la caserne, côté rue (82, rue du Faubourg-Poissonnière) : la gravure au-dessus du porche, en vrai relief —
d'après la photo (images/porche.jpg, 900 × 812 px ; 6,8 m de large, 132,4 px au mètre ; le bas de l'image au-dessus du passage, à 4,4 m) :
les pierres en bossage rustique (face piquée, joints creux) ; l'arc en anse de panier et ses quinze claveaux, la clé qui monte jusqu'à la corniche ;
la lunette fermée de sa grille de pierre à carreaux ; au milieu, le navire de Paris sur ses vagues (relief tiré de la photo) ;
le linteau mouluré et ses consoles ; la plaque « CASERNE DE LA NOUVELLE FRANCE » en lettres de pierre, les deux casques de pompier.
Repère de Blender : la façade sur rue est le plan y = -29,35 (z = -12 de la rue, décalée de 41,35 m), tournée vers -y (la rue)."""
import bpy, bmesh, math, os
import numpy as np
from mathutils import Matrix
from horloge import Atelier, mat, mat_tex, TEX

F = -29.35; K = 132.4; C0 = 440
X = lambda c: (c - C0) / K
Z = lambda r: 4.4 + (812 - r) / K
AI, BI, ZC = 2.68, 2.25, Z(595)          # (l'arc : demi-axes de l'intrados, la ligne des naissances)
AO, BO = AI + .8, BI + .8

def plaque(A, m, pts, y0, y1, uv=1.0):
    """un polygone (x, z) épaissi de y0 à y1"""
    b = A._b(m); av = [b.verts.new((x, y0, z)) for x, z in pts]; ar = [b.verts.new((x, y1, z)) for x, z in pts]; n = len(pts)
    b.faces.new(av); b.faces.new(ar[::-1])
    for i in range(n): b.faces.new((av[i], ar[i], ar[(i + 1) % n], av[(i + 1) % n]))
    A._uv(b, av + ar, uv)

def relief_photo(img, c0, c1, r0, r1, ybase, prof, nx=110):
    """un morceau de la photo, en relief : une grille déplacée vers la rue selon la lumière de la photo (adoucie), peinte de la photo elle-même"""
    w, h = img.size; px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[..., :3] @ np.array([.3, .59, .11], dtype=np.float32)
    for _ in range(6): px = (px * 2 + np.roll(px, 1, 0) + np.roll(px, -1, 0) + np.roll(px, 1, 1) + np.roll(px, -1, 1)) / 6
    ny = max(2, int(nx * (r1 - r0) / (c1 - c0)))
    me = bpy.data.meshes.new("relief"); bm = bmesh.new(); uv = bm.loops.layers.uv.new()
    vs = []; cr = px[h - 1 - r1:h - 1 - r0, c0:c1]; lo, hi = np.percentile(cr, 5), np.percentile(cr, 97)
    for j in range(ny + 1):
        ligne = []
        for i in range(nx + 1):
            c = c0 + (c1 - c0) * i / nx; r = r0 + (r1 - r0) * j / ny
            l = px[min(h - 1, max(0, h - 1 - int(r))), min(w - 1, int(c))]; t = np.clip((l - lo) / (hi - lo + 1e-6), 0, 1)
            bord = min(i, nx - i, j, ny - j) / 4.0
            ligne.append(bm.verts.new((X(c), ybase - prof * t * min(1, bord), Z(r))))
        vs.append(ligne)
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((vs[j][i], vs[j + 1][i], vs[j + 1][i + 1], vs[j][i + 1]))
            for l in f.loops:
                l[uv].uv = ((l.vert.co.x * K + C0) / w, 1 - (812 - (l.vert.co.z - 4.4) * K) / h)
    bm.to_mesh(me); bm.free(); return me

def construire():
    PIERRE = mat_tex("nc_bossage", "bossage", .9, 1.2); LISSE = mat_tex("nc_pierre", "pierre", .7, .6)
    JOINT = mat("nc_joint", (.42, .40, .36), .95); NOIR = mat("nc_sombre", (.12, .11, .1), .9)
    A = Atelier(); objs = []
    # le fond : les joints (creux, plus sombres), sur toute la gravure
    A.de(JOINT, X(0) - .05, X(900) + .05, F - .04, F, Z(812), Z(60))
    # les pierres en bossage : des assises de 44 cm, des blocs de 1,1 à 1,4 m décalés d'une assise à l'autre ; rien dans l'arc
    def ext(x): return ZC + BO * math.sqrt(max(0, 1 - (x / AO) ** 2)) if abs(x) < AO else -1
    z = ZC; rang = 0
    while z < Z(60) - .05:
        z1 = min(z + .44, Z(60)); x = X(0) - (.55 if rang % 2 else 0); larg = [1.3, 1.1, 1.4, 1.2]
        i = 0
        while x < X(900):
            x1 = min(x + larg[(i + rang) % 4], X(900)); x0 = max(x, X(0))
            if x1 - x0 > .1:
                n = max(1, int((x1 - x0) / .12))
                for k in range(n):   # (en tranches fines : la pierre s'arrête contre l'extrados de l'arc)
                    a, b = x0 + (x1 - x0) * k / n + (.018 if k == 0 else 0), x0 + (x1 - x0) * (k + 1) / n - (.018 if k == n - 1 else 0)
                    zb = max(z + .018, ext((a + b) / 2) + .02)
                    if z1 - .018 - zb > .04: A.de(PIERRE, a, b, F - .2, F - .04, zb, z1 - .018)
            x = x1; i += 1
        z = z1; rang += 1
    # l'arc : quinze claveaux, un sur deux plus long ; la clé, haute, qui monte jusqu'à la corniche
    n = 15
    for i in range(n):
        t0, t1 = math.pi * i / n + .012, math.pi * (i + 1) / n - .012
        if i == n // 2:
            plaque(A, PIERRE, [(-.36, ZC + BI), (.36, ZC + BI), (.44, Z(60)), (-.44, Z(60))], F - .34, F - .04); continue
        ro = 1.0 + (.18 if i % 2 else 0)
        pts = [(-AI * math.cos(t0), ZC + BI * math.sin(t0)), (-AI * math.cos(t1), ZC + BI * math.sin(t1)),
               (-(AI + .8 * ro) * math.cos(t1), ZC + (BI + .8 * ro) * math.sin(t1)), (-(AI + .8 * ro) * math.cos(t0), ZC + (BI + .8 * ro) * math.sin(t0))]
        plaque(A, PIERRE, pts, F - .28, F - .04)
    # la lunette : le fond sombre, la grille de pierre à carreaux (barreaux de 9 cm, carreaux de 34 cm), le panneau du navire
    demi = [(-AI * math.cos(math.pi * k / 32), ZC + BI * math.sin(math.pi * k / 32)) for k in range(33)]
    LUN = mat("nc_lunette", (.16, .15, .14), .95)
    for k in range(40):   # (le fond de la lunette, sombre : en tranches sous l'intrados)
        x0, x1 = -AI + 2 * AI * k / 40, -AI + 2 * AI * (k + 1) / 40; xm = max(abs(x0), abs(x1))
        A.de(LUN, x0, x1, F - .08, F - .04, ZC, ZC + BI * math.sqrt(max(0, 1 - (min(xm, AI) / AI) ** 2)) + .02)
    xn0, xn1 = X(305), X(560)
    for k in range(-9, 10):
        x = k * .3
        if xn0 - .05 < x < xn1 + .05 or abs(x) > AI - .05: continue
        zt = ZC + BI * math.sqrt(max(0, 1 - (x / AI) ** 2)); A.de(LISSE, x - .05, x + .05, F - .2, F - .06, ZC, zt)
    zz = ZC + .02
    while zz < ZC + BI - .05:
        hw = AI * math.sqrt(max(0, 1 - ((zz - ZC) / BI) ** 2))
        for a, b in ((-hw, min(xn0, hw)), (max(xn1, -hw), hw)):
            if b - a > .05: A.de(LISSE, a, b, F - .19, F - .07, zz, zz + .1)
        zz += .3
    A.de(LISSE, xn0, xn1, F - .14, F - .04, ZC, Z(290))
    # le linteau mouluré, son panneau, les consoles ; la plaque, ses pilastres en bossage
    A.de(LISSE, X(0), X(900), F - .3, F - .04, Z(680), ZC); A.de(LISSE, X(85), X(770), F - .34, F - .3, Z(668), Z(610))
    A.de(LISSE, X(0) - .05, X(900) + .05, F - .38, F - .04, ZC - .08, ZC + .02)
    for a, b in ((X(0), X(85)), (X(770), X(900))): A.de(LISSE, a, b, F - .42, F - .04, Z(690), ZC + .05)
    A.de(LISSE, X(110), X(730), F - .18, F - .04, Z(812), Z(680))
    for a, b in ((X(45), X(110)), (X(730), X(790))): A.de(PIERRE, a, b, F - .26, F - .04, Z(812), Z(680))
    objs += A.objets("entree")
    # les reliefs tirés de la photo : le navire et ses vagues, les deux casques
    img = bpy.data.images.load(os.path.join(TEX, "porche.jpg")); PH = bpy.data.materials.new("nc_porche_photo"); PH.use_nodes = True
    nt = PH.node_tree; ti = nt.nodes.new("ShaderNodeTexImage"); ti.image = img; nt.links.new(ti.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"]); nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = .9
    for c0, c1, r0, r1, base, prof, nx in ((305, 560, 280, 598, F - .14, .2, 140), (160, 255, 668, 752, F - .18, .1, 50), (580, 675, 668, 752, F - .18, .1, 50)):
        me = relief_photo(img, c0, c1, r0, r1, base, prof, nx); me.materials.append(PH)
        o = bpy.data.objects.new("entree_relief", me); bpy.context.scene.collection.objects.link(o); objs.append(o)
    # les lettres de pierre
    for texte, taille, cx, r in (("CASERNE", .27, X(418), 702), ("DE", .16, X(340), 735), ("LA", .16, X(490), 735), ("NOUVELLE", .3, X(282), 770), ("FRANCE", .3, X(580), 770)):
        cu = bpy.data.curves.new("lettres", "FONT"); cu.body = texte; cu.size = taille; cu.extrude = .015; cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.space_character = 1.12
        ob = bpy.data.objects.new("lettres", cu); bpy.context.scene.collection.objects.link(ob)
        ob.rotation_euler = (math.pi / 2, 0, 0); ob.location = (cx, F - .2, Z(r)); bpy.context.view_layer.update()
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get())); me.transform(ob.matrix_world)
        bpy.data.objects.remove(ob); me.materials.append(LISSE)
        o = bpy.data.objects.new("entree_lettres", me); bpy.context.scene.collection.objects.link(o); objs.append(o)
    return objs

def ancienne_photo(o, boite):
    """la photo plate du porche de 1990 (un simple rectangle de 6,8 × 5,68 m posé sur la façade) : remplacée par le relief"""
    b = boite
    return len(o.data.vertices) == 4 and abs(b[0] + 3.4) < .1 and abs(b[1] - 3.4) < .1 and abs(b[4] - 4.4) < .1 and abs(b[5] - 10.08) < .1 and abs(b[2] - F) < .2
