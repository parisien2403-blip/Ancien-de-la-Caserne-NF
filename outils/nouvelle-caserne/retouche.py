"""La retouche d'un intérieur, dans Blender : chaque matière reçoit son relief, chaque arête son chanfrein.
— une matière peinte d'une image (carrelage, parquet, boiseries, briques, tissus…) : le relief est tiré de l'image elle-même
  (les joints, plus sombres, se creusent ; le grain du bois, des pierres ressort) ;
— une matière d'une seule couleur (murs, plafonds, meubles laqués) : le grain fin du plâtre peint, posé à l'échelle réelle ;
— les vitres, écrans, enseignes lumineuses, images détourées : laissés tels quels."""
import bpy, bmesh, os, numpy as np
from horloge import uv_boite_monde
D = os.path.dirname(os.path.abspath(__file__))

def relief_image(img, force):
    w, h = img.size; px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    l = px[..., :3] @ np.array([.3, .59, .11], dtype=np.float32)
    for _ in range(2): l = (l * 2 + np.roll(l, 1, 0) + np.roll(l, -1, 0) + np.roll(l, 1, 1) + np.roll(l, -1, 1)) / 6
    k = force * max(w, h) / 512
    gx = (np.roll(l, -1, 1) - np.roll(l, 1, 1)) * k; gy = (np.roll(l, -1, 0) - np.roll(l, 1, 0)) * k
    n = np.dstack([-gx, -gy, np.ones_like(l)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    out = np.dstack([n * .5 + .5, np.ones_like(l)]).astype(np.float32)
    im = bpy.data.images.new(img.name + "_relief", w, h); im.pixels.foreach_set(out.ravel()); im.colorspace_settings.name = "Non-Color"
    if max(w, h) > 512: k = 512 / max(w, h); im.scale(max(1, int(w * k)), max(1, int(h * k)))
    im.pack()
    return im

def brancher(mat, im, force, uvmap=None):
    nt = mat.node_tree; b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if not b or b.inputs["Normal"].is_linked: return False
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = im
    if uvmap:
        u = nt.nodes.new("ShaderNodeUVMap"); u.uv_map = uvmap; nt.links.new(u.outputs["UV"], t.inputs["Vector"])
    else:
        src = b.inputs["Base Color"].links[0].from_node if b.inputs["Base Color"].is_linked else None
        if src and src.type == "TEX_IMAGE" and src.inputs["Vector"].is_linked: nt.links.new(src.inputs["Vector"].links[0].from_socket, t.inputs["Vector"])
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = force
    nt.links.new(t.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"]); return True

def retoucher(sc, chanfreins=True):
    platre = bpy.data.images.load(os.path.join(D, "tex", "platre_n.png")); platre.colorspace_settings.name = "Non-Color"
    faits = {}; nI = nU = 0
    for o in [o for o in sc.objects if o.type == "MESH"]:
        for s in o.material_slots:
            m = s.material
            if not m or not m.use_nodes or m.name in faits: continue
            if m.name.startswith("nc_porche_photo"): faits[m.name] = 0; continue   # (la photo du navire et des casques : déjà en relief, et son ombre est dans la photo)
            b = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
            if not b: faits[m.name] = 0; continue
            transp = m.blend_method != "OPAQUE" or b.inputs["Alpha"].is_linked or b.inputs["Alpha"].default_value < .99
            lum = b.inputs["Emission Strength"].default_value > 0 and (b.inputs["Emission Color"].is_linked or max(b.inputs["Emission Color"].default_value[:3]) > .05)
            if transp or lum: faits[m.name] = 0; continue
            src = b.inputs["Base Color"].links[0].from_node if b.inputs["Base Color"].is_linked else None
            if src and src.type == "TEX_IMAGE" and src.image and min(src.image.size) >= 32:
                brancher(m, relief_image(src.image, 2.0), 1.0); faits[m.name] = 1; nI += 1
            elif not src:
                faits[m.name] = 2; nU += 1
            else: faits[m.name] = 0
        if len(o.material_slots) == 1 and faits.get(o.material_slots[0].name) == 2 and o.material_slots[0].material:
            if "relief" not in o.data.uv_layers:
                o.data.uv_layers.new(name="relief")
            act = o.data.uv_layers.active; o.data.uv_layers.active = o.data.uv_layers["relief"]
            uv_boite_monde(o, 2.0); o.data.uv_layers.active = act
    # les arêtes : un petit chanfrein (1 cm) sur tout ce qui est plein — tables, chaises, boiseries, plinthes, encadrements accrochent la lumière
    nB = 0
    for o in [o for o in sc.objects if o.type == "MESH" and chanfreins]:
        if any(faits.get(s.name, 0) == 0 and s.material and s.material.blend_method != "OPAQUE" for s in o.material_slots): continue
        # (les boîtes du jeu ont chaque face à part : on soude les sommets, on lisse selon l'angle — les arêtes vives restent vives)
        bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=.0005); bm.to_mesh(o.data); bm.free()
        if o.data.has_custom_normals: o.data.free_normals_split() if False else None
        with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o], selected_editable_objects=[o]):
            if o.data.has_custom_normals: bpy.ops.mesh.customdata_custom_splitnormals_clear()
        for p in o.data.polygons: p.use_smooth = True
        o.data.use_auto_smooth = True; o.data.auto_smooth_angle = 0.6
        bv = o.modifiers.new("chanfrein", "BEVEL"); bv.width = .01; bv.segments = 1; bv.limit_method = "ANGLE"; bv.angle_limit = 0.7; bv.use_clamp_overlap = True; nB += 1
    print("CHANFREINS", nB)
    for nom, v in faits.items():
        if v == 2: brancher(bpy.data.materials[nom], platre, .6, "relief")
    print("RETOUCHE : reliefs tirés des images", nI, "; grain du plâtre", nU)
