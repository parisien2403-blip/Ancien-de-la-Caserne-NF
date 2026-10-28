# La nouvelle caserne (chantier)

La cour d'honneur de la nouvelle caserne (lieu « nc », administrateur seul) se fabrique ainsi :

1. `export-cour.js` (Playwright) ouvre le jeu, va dans la cour d'honneur de 1990 et l'exporte telle quelle
   (géométrie et textures) dans `cour-1990.glb`. Le mot de passe de l'administrateur se donne par la variable
   d'environnement `CASERNE_MDP` (jamais écrit dans le dépôt). Il faut aussi `GLTFExporter.patch.js` et
   `TextureUtils.patch.js` (ceux de three r160, importés depuis `/vendor/three.module.js`).
2. `textures.py` fabrique les textures (brique, pierre du socle, pierre claire) et leurs cartes de relief, dans `tex/`.
3. `blender -b -P nc_cour.py -- <dossier de sortie>` (avec `FMT=WEBP`) : importe la cour, retire les bâtiments
   déjà refaits, construit les nouveaux (`horloge.py`, …), regroupe par matière, exporte `cour.glb`
   à copier dans `public/modeles/nc/` (et augmenter `NC_V` dans `public/matrice.js`).

Bâtiments refaits en relief : le bâtiment de l'horloge (`horloge.py`).
