# La nouvelle caserne (chantier)

La nouvelle caserne (lieux « nc », « nc-fetes », « nc-mess », « nc-etage », « nc-cave », « nc-appart » ; administrateur seul) se fabrique ainsi :

1. **Exporter la caserne de 1990** (Playwright, jeu lancé en local) :
   - `LIEU=grande SORTIE=grande-1990.glb node export-carte.js`, puis `LIEU=rue SORTIE=rue-1990.glb node export-carte.js` : la cour et ses cours, la rue ;
   - `LIEU=mess node export-interieur.js` (et `fetes`, `etage`, `cave`, `appart`) : les morceaux immobiles d'un intérieur
     (`<lieu>-1990.glb`) et leur liste de signatures (`<lieu>.json`). Ce qui bouge, s'allume la nuit ou que la logique tient en main reste au jeu.
   Le mot de passe de l'administrateur se donne par la variable d'environnement `CASERNE_MDP` (jamais écrit dans le dépôt).
   Il faut aussi `GLTFExporter.patch.js` et `TextureUtils.patch.js` (ceux de three r160).
2. `python3 textures.py` fabrique les textures (brique, pierre du socle, pierre claire, pavés carrés posés au hasard, plâtre) et leurs cartes de relief, dans `tex/`.
3. **La carte** : `FMT=WEBP blender -b -P nc_carte.py -- <sortie> [--rendu]` : la rue posée à sa place (PORCHE_DZ), les doublons et décors de fond retirés,
   les pavés, les bâtiments refaits en relief (`horloge.py`, `cotes.py`, `porche.py`, `verso.py`), puis toute la carte retouchée (`retouche.py`) ; exporte `carte.glb`.
4. **Un intérieur** : `blender -b -P nc_lieu.py -- <lieu> <sortie>` : importé, regroupé par matière, retouché (`retouche.py`) ; exporte `<lieu>.glb`.
5. Compression : `gltfpack -i <in> -o public/modeles/nc/<nom>.glb -cc -kn -km` (meshopt ; le jeu a `vendor/meshopt_decoder.module.js`),
   copier aussi `<lieu>.json`, et augmenter `NC_V` dans `public/matrice.js`.

La retouche (`retouche.py`) : chaque matière peinte d'une image reçoit un relief tiré de l'image (joints creusés, grain du bois et de la pierre),
chaque matière d'une seule couleur le grain du plâtre ; toutes les arêtes un chanfrein d'un centimètre.
