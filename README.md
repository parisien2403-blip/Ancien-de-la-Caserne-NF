# Caserne de la Nouvelle France

Application des anciens de la Caserne de la Nouvelle France (Garde républicaine, années 70 à 90).

> **Maquette** : tout fonctionne dans le navigateur, mais rien n'est encore enregistré.
> Ce qu'on ajoute (laissez-passer, photos, anecdotes, MP3) disparaît en fermant la page.

## Les pages

| Onglet | Rôle |
| --- | --- |
| **Poste de police** | Le planton accueille les nouveaux. On remplit sa demande (nom, prénom, Fils / Fille du Garde ou Gendarme, photo) et on obtient son **laissez-passer** tamponné, téléchargeable en image. |
| **Bibliothèque** | Partage de photos, classées par période (années 70, 80, 90, aujourd'hui), avec commentaires. |
| **Salle des jeunes** | Anecdotes de la caserne, avec image facultative et commentaires. |
| **Salle des fêtes** | Partage et écoute de morceaux MP3. |

## Voir l'appli

Ouvrir `index.html` dans un navigateur, ou activer **GitHub Pages** sur le dépôt
(Settings → Pages → branche `main`, dossier `/root`) : l'appli sera alors en ligne à l'adresse
`https://<votre-compte>.github.io/<nom-du-depot>/`.

## Fichiers

```
index.html          l'application (HTML, CSS et JavaScript dans un seul fichier)
images/porche.jpg   le porche de la caserne (bateau sculpté + plaque), écran d'accueil
images/plaque.jpg   la plaque « Caserne de la Nouvelle France », en-tête des pages
images/garde.jpg    le planton du poste de police
```

## À prévoir avant une vraie mise en ligne

- Comptes et sauvegarde (par exemple avec Supabase) : inscriptions validées par les administrateurs,
  numéro de laissez-passer attribué automatiquement, photos, anecdotes et MP3 enregistrés.
- Droits sur la photo du planton (`images/garde.jpg`), ou la remplacer par une illustration.
- Musique : privilégier les enregistrements personnels ; les chansons du commerce sont soumises aux droits d'auteur.
- Photos de personnes : pouvoir retirer une photo ou une identification sur demande (RGPD).
