"""Textures de la nouvelle caserne (2 m × 2 m par image, qui se répètent) : la couleur, et le relief (normal map)."""
import numpy as np, os, sys
from PIL import Image, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, "tex"); os.makedirs(OUT, exist_ok=True)
N = 1024; PX = N / 2.0          # px par mètre
rng = np.random.default_rng(5)

def bruit(echelle, n=N, oct=4):
    acc = np.zeros((n, n)); amp = 1; tot = 0
    for o in range(oct):
        k = max(2, int(n / echelle * 2 ** o)); g = rng.random((k + 1, k + 1)); g[-1, :] = g[0, :]; g[:, -1] = g[:, 0]
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((n, n), Image.BICUBIC)
        acc += np.asarray(im, float) / 255 * amp; tot += amp; amp *= .5
    return acc / tot

def normale(h, force):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * force; gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * force
    n = np.dstack([-gx, gy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return Image.fromarray(((n * .5 + .5) * 255).astype(np.uint8))

def appareil(lb, hb, joint, decal=.5, varie=.12, base=(0, 0, 0), bosse=0.0, chanfrein=0.0):
    """un mur de pierres ou de briques : lb × hb (m), joints de `joint` m ; rend la couleur et la hauteur"""
    col = np.zeros((N, N, 3)); h = np.zeros((N, N))
    yy, xx = np.mgrid[0:N, 0:N] / PX
    rang = np.floor(yy / hb).astype(int); xo = xx + (rang % 2) * lb * decal; ix = np.floor(xo / lb).astype(int)
    fx = (xo % lb) / lb; fy = (yy % hb) / hb
    jx = joint / lb; jy = joint / hb
    dans = (fx > jx / 2) & (fx < 1 - jx / 2) & (fy > jy / 2) & (fy < 1 - jy / 2)
    # une teinte par pierre
    nb = rang.max() + 2, ix.max() + 2; t = rng.random(nb) * 2 - 1; t2 = rng.random(nb) * 2 - 1
    tp = t[rang % nb[0], ix % nb[1]]; tp2 = t2[rang % nb[0], ix % nb[1]]
    for k in range(3): col[..., k] = base[k] * (1 + varie * tp) * (1 + varie * .35 * tp2 * (k == 0))
    grain = bruit(N / 6) - .5; grain2 = bruit(N / 40, oct=3) - .5
    col *= (1 + .18 * grain[..., None] + .10 * grain2[..., None])
    # le bord de chaque pierre, un peu arrondi ; la pierre bombée (bossage)
    d = np.minimum(np.minimum(fx - jx / 2, 1 - jx / 2 - fx) * lb, np.minimum(fy - jy / 2, 1 - jy / 2 - fy) * hb)
    h = np.where(dans, np.clip(d / max(chanfrein, .004), 0, 1) * (1 + bosse * np.clip(d / .1, 0, 1)) + .15 * grain + .05 * grain2, 0)
    mort = np.array([.62, .59, .54]) * (1 + .15 * grain[..., None])
    col = np.where(dans[..., None], col, mort * (.9 if base[0] > .5 else .85))
    return np.clip(col, 0, 1), h

def ecrire(nom, col, h, force):
    Image.fromarray((col * 255).astype(np.uint8)).save(os.path.join(OUT, nom + ".png"))
    normale(h, force).save(os.path.join(OUT, nom + "_n.png"))

# la brique rouge (22 × 6,5 cm, joints d'1 cm) : comme la façade de l'horloge
c, h = appareil(.23, .075, .011, base=(.50, .19, .12), varie=.16, chanfrein=.006); ecrire("brique", c, h, 2.2)
# la pierre du socle : grandes pierres de taille (1 m × 0,5 m), joints creux
c, h = appareil(1.0, .5, .018, base=(.86, .82, .74), varie=.05, chanfrein=.02, bosse=.4); ecrire("socle", c, h, 3.0)
# la pierre claire des encadrements, corniches, balcons (lisse, sans joints visibles)
g = bruit(N / 8) - .5; c = np.clip(np.dstack([np.full((N, N), v) for v in (.90, .88, .83)]) * (1 + .08 * g[..., None]), 0, 1)
ecrire("pierre", c, g * .4, 1.0)
print("ok")

# les pavés (granit gris) : des carrés, tous de la même taille (11 cm), un peu irréguliers (bords taillés à la main, coins émoussés, légèrement de travers),
# posés simplement au sol : rang après rang, chaque rang décalé au hasard — pas d'arcs, pas de cercles ; joints de sable creusés
def paves():
    n = 18; c = 2.0 / n; cote = c * .86                     # (18 × 18 pavés sur les 2 m de l'image)
    yy, xx = np.mgrid[0:N, 0:N] / PX
    dec = rng.random(n) * c                                  # (le décalage de chaque rang)
    ang = (rng.random((n, n)) - .5) * .14; jx = (rng.random((n, n, 2)) - .5) * c * .08; tt = rng.random((n, n)); ec = 1 + (rng.random((n, n, 2)) - .5) * .06
    r = np.floor(yy / c).astype(int) % n; xo = (xx + dec[r]) % 2.0; j = np.floor(xo / c).astype(int) % n
    u0 = xo - (j + .5) * c - jx[r, j, 0]; v0 = yy - (np.floor(yy / c) + .5) * c - jx[r, j, 1]
    a = ang[r, j]; u = np.cos(a) * u0 + np.sin(a) * v0; v = -np.sin(a) * u0 + np.cos(a) * v0
    hu = cote / 2 * ec[r, j, 0]; hv = cote / 2 * ec[r, j, 1]
    g = bruit(N / 30, oct=3) - .5; gb = bruit(N / 12, oct=2) - .5
    # (un carré aux coins émoussés : distance au bord, avec un bord un peu irrégulier)
    ru = .012; du = np.abs(u) - (hu - ru); dv = np.abs(v) - (hv - ru)
    ext = np.hypot(np.maximum(du, 0), np.maximum(dv, 0)) + np.minimum(np.maximum(du, dv), 0) - ru + gb * .008
    dans = ext < 0; e = -ext
    t = tt[r, j]
    base = np.array([.52, .51, .50]) * (.74 + .42 * t[..., None]) * (1 + .22 * g[..., None])
    h = np.where(dans, np.clip(e / .025, 0, 1) ** .6 + .2 * g, 0)
    sable = np.array([.40, .37, .32]) * (1 + .2 * g[..., None])
    col = np.where(dans[..., None], base, sable)
    ecrire("paves", np.clip(col, 0, 1), h, 3.5)
paves(); print("paves ok")

# le plâtre des murs intérieurs, peint : un grain très fin, quelques reprises à la taloche (relief seul)
def platre():
    g = bruit(N / 60, oct=3) - .5; t = bruit(N / 4, oct=2) - .5
    ecrire("platre", np.full((N, N, 3), .8), g * .5 + t * .8, 1.6)
platre(); print("platre ok")
