# Caserne de la Nouvelle France

Application des anciens de la Caserne de la Nouvelle France (Garde républicaine, années 70 à 90).

> **Tout est enregistré sur le serveur Cloudflare** et se retrouve sur n'importe quel appareil (téléphone, PC)
> dès qu'on se connecte : laissez-passer, photo d'identité, membres, courrier, photos de la bibliothèque, anecdotes
> et commentaires. Seule exception pour l'instant : les médias de la **Salle des fêtes** (MP3, vidéos), trop lourds
> pour ce stockage — il faudra Cloudflare R2.

## Les pages

| Onglet | Rôle |
| --- | --- |
| **Accueil** | Page de garde : photo du porche avec la météo en direct, **fil de publications** façon mur (texte libre, photo, ❤️ J'aime, commentaires), mot de bienvenue repliable, derniers anciens arrivés, adresse avec carte et itinéraire. |
| **Poste de police** | Le chef de poste accueille les nouveaux. On remplit sa demande (nom, prénom, Fils / Fille du Garde ou Gendarme, photo) et on obtient son **laissez-passer** tamponné, avec son **numéro** (0001, 0002…), son **adresse de la caserne** (`prenom.nom@caserne-nf`) et un **code provisoire à 6 chiffres**. |
| **Bibliothèque** | Partage de photos, chacune rangée sous un **thème libre** choisi par celui qui la dépose ; filtre par thème, commentaires. |
| **Salle des jeunes** | Anecdotes de la caserne, avec image facultative et commentaires. |
| **Salle des fêtes** | Musique (MP3), vidéos et photos des soirées, et **la borne** : un émulateur (EmulatorJS, chargé depuis cdn.emulatorjs.org) dont l'écran s'affiche dans la télé ; seul l'administrateur ajoute ou retire des jeux (stockés sur le serveur, réservés aux anciens validés). |
| **Membres de la Caserne** | Le registre des anciens, **par ordre alphabétique du nom de famille**, avec photo ; un clic ouvre **la carte (laissez-passer) du membre**. |
| **Vaguemestre** | Le courrier interne : reçus, envoyés, écrire, répondre. |

## Pastille du membre (en haut à droite)

Photo d'identité du membre, avec un **point vert** (connecté) ou **rouge** (déconnecté). Un clic ouvre les réglages :
voir son laissez-passer, changer sa photo, activer / désactiver les **notifications du téléphone** (nouveau courrier
du vaguemestre), se déconnecter.

## Connexion

1. Au poste de police, le laissez-passer tamponné donne un **code provisoire à 6 chiffres** (affiché une seule fois).
2. On se connecte avec **prénom + nom + code provisoire**.
3. L'appli demande alors de **créer son mot de passe** (8 caractères minimum) ; le code provisoire ne sert plus.
4. Ensuite : **prénom + nom + mot de passe**.

Les mots de passe et codes sont stockés chiffrés (PBKDF2). Après 5 essais ratés, le compte est bloqué 15 minutes.

## Administrateur

Un seul administrateur : **Germain-Pierre Bouquet** (prénom et nom dans `wrangler.jsonc`, variables `ADMIN_PRENOM` / `ADMIN_NOM`).
Son mot de passe n'est **jamais dans le code** : c'est un **secret Cloudflare** nommé `ADMIN_MOT_DE_PASSE`
(tableau de bord Cloudflare → le Worker → Paramètres → Variables et secrets).

- Il se connecte d'office avec prénom + nom + ce mot de passe, sans code provisoire.
- Il fait son laissez-passer au poste de police : numéro et adresse de la caserne créés comme pour tout le monde.
- Dans **Membres de la Caserne**, il voit un bouton **Supprimer** sur chaque compte (le compte et son courrier sont effacés).
- Personne d'autre ne peut s'inscrire sous son nom.

## Android, iPhone / iPad et PC

L'appli est **installable** (Progressive Web App) depuis son adresse :

- **Android** (Chrome) : bouton « Installer l'appli » sur l'écran d'accueil, ou menu ⋮ → « Installer l'application ».
- **iPhone / iPad** (Safari) : Partager ⬆︎ → « Sur l'écran d'accueil ».
- **PC / Mac** (Chrome ou Edge) : icône d'installation dans la barre d'adresse.

Elle s'ouvre alors en plein écran, avec l'icône de l'horloge de la caserne. Sur un écran large (PC), la mise en page
passe en version ordinateur : menu à gauche, contenu sur toute la largeur.

## Voir l'appli

Ouvrir `public/index.html` dans un navigateur.

En ligne, le site est hébergé par **Cloudflare** (Workers, fichiers statiques) : chaque modification
poussée sur la branche `main` est redéployée automatiquement. La configuration est dans `wrangler.jsonc`.

## Fichiers

```
public/index.html          l'application (HTML, CSS et JavaScript dans un seul fichier)
public/manifest.webmanifest, public/sw.js, public/icons/   ce qui rend l'appli installable
public/images/porche.jpg   le porche de la caserne (bateau sculpté + plaque), écran d'accueil
public/images/plaque.jpg   la plaque « Caserne de la Nouvelle France », en-tête des pages
public/images/garde.jpg    le planton du poste de police
src/index.js               serveur Cloudflare : sert le site, tient les laissez-passer, les membres et le courrier
wrangler.jsonc             configuration Cloudflare (site public/ + registre de la caserne)
```

## À prévoir avant une vraie mise en ligne

- **Mot de passe oublié** : pour l'instant, un administrateur doit réinitialiser le compte.
- **Validation par les administrateurs** des nouvelles inscriptions, et protection du site
  (par exemple Cloudflare Access) pour que seuls les anciens voient le registre et le courrier.
- **Salle des fêtes** (vidéos, MP3) : stockage Cloudflare R2 à activer.
- **Adresses e-mail réelles** : les adresses `@caserne-nf` ne servent qu'au courrier interne. Pour de vraies
  adresses, il faut un nom de domaine et un service d'e-mail.
- **Applications dans les stores** (Google Play, App Store) si besoin, en plus de l'appli installable.
- Droits sur la photo du chef de poste (`public/images/garde.jpg`), ou la remplacer par une illustration.
- Musique et vidéos : privilégier les enregistrements personnels ; les œuvres du commerce sont soumises aux droits d'auteur.
- Photos de personnes : pouvoir retirer une photo ou une identification sur demande (RGPD).

## Version de l'appli

Le numéro de version est dans `public/index.html` (tableau `VERSIONS`, la plus récente en premier, avec la liste des nouveautés affichée dans « Quoi de neuf ? ») **et** dans `public/version.json`. Les deux doivent être changés ensemble à chaque nouvelle version : le bouton « 🔄 Mise à jour de l'appli » compare les deux.

## La Matrice (onglet « Matrice »)

Les anciens se retrouvent en 3D devant l'entrée, rue du Faubourg-Poissonnière (le porche mène à la cour d'honneur), dans la cour d'honneur et dans la salle des fêtes (on y entre par les portes vitrées du bâtiment de droite). L'arc au navire et la plaque de l'entrée sont la vraie photo `public/images/porche.jpg`.

- `public/matrice.js` : les décors (three.js 0.160, fourni avec le site dans `public/vendor/`), les bonshommes, la connexion en direct.
- Le bonhomme : tenue, couleur et tête détourée **dans le téléphone** (MediaPipe, modèle `selfie_multiclass_256x256` chargé depuis storage.googleapis.com) ; seule la tête découpée (PNG) est envoyée (`PUT /api/moi/avatar`).
- Présence et discussion : WebSocket `/api/matrice` vers le Durable Object (API « hibernation ») ; les messages s'effacent au bout d'une heure (20 au plus par lieu), chacun peut retirer les siens et l'administrateur tous. L'administrateur peut faire taire (1 h) ou exclure (24 h).
