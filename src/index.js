// Caserne de la Nouvelle France : sert le site (dossier public/) et tient le registre de la caserne :
// numéros de laissez-passer (0001, 0002…), membres et courrier du vaguemestre.
// Le registre est un Durable Object : un seul exemplaire pour toute la caserne, donc deux
// inscriptions simultanées ne reçoivent jamais le même numéro.

import { DurableObject } from "cloudflare:workers";

const DOMAINE = "caserne-nf";
const QUALITES = ["fils du Garde", "fille du Garde", "Gendarme"];

const texte = (v, max) => String(v ?? "").trim().slice(0, max);
const slug = v => texte(v, 40).normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const numero = n => String(n).padStart(4, "0");

// mots de passe et codes provisoires : jamais stockés en clair (PBKDF2, sel aléatoire)
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
async function hacher(secret, sel = crypto.getRandomValues(new Uint8Array(16))) {
  const cle = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sel, iterations: 100000 }, cle, 256);
  return `pbkdf2$${b64(sel)}$${b64(bits)}`;
}
async function verifier(secret, empreinte) {
  if (!empreinte || !secret) return false;
  const [, sel] = empreinte.split("$");
  return (await hacher(String(secret), Uint8Array.from(atob(sel), c => c.charCodeAt(0)))) === empreinte;
}
const codeProvisoire = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
const ESSAIS_MAX = 5, BLOCAGE_MIN = 15;

// photo d'identité : petite image JPEG réduite par l'appli (quelques dizaines de Ko)
const PHOTO_MAX = 400000;
// images partagées (bibliothèque, anecdotes) : JPEG réduit par l'appli, ≤ 1,5 Mo encodé
const IMAGE_MAX = 1500000;
const imageValide = v => typeof v === "string" && v.startsWith("data:image/jpeg;base64,") && v.length <= IMAGE_MAX ? v : null;
const photoValide = v => typeof v === "string" && v.startsWith("data:image/jpeg;base64,") && v.length <= PHOTO_MAX ? v : null;

// ce qu'on peut commenter ou retirer : type → table
const TABLES = { photo: "photos", anecdote: "anecdotes", publication: "publications" };

const MORCEAU = 1024 * 1024, JEU_MAX = 32 * 1024 * 1024;
// image d'une cartouche : une petite image JPEG/PNG/WebP déjà réduite par l'appli (300 Ko maximum)
function jaquette(v) {
  if (v == null || v === "") return null;
  if (typeof v !== "string" || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v)) throw new Refus("Image invalide");
  if (v.length > 400000) throw new Refus("Image trop lourde");
  return v;
}

class Refus extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export class Compteur extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS membres (
      numero INTEGER PRIMARY KEY, nom TEXT, prenom TEXT, qualite TEXT, parent TEXT,
      email TEXT UNIQUE, token TEXT UNIQUE, cree TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, de TEXT, a TEXT, sujet TEXT, texte TEXT,
      envoye TEXT, lu INTEGER DEFAULT 0)`);
    for (const col of ["chiffre TEXT"]) { try { this.sql.exec(`ALTER TABLE messages ADD COLUMN ${col}`); } catch (e) { /* déjà là */ } }
    // colonnes ajoutées avec la connexion (code provisoire puis mot de passe personnel)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, titre TEXT, theme TEXT, annee TEXT, image INTEGER, auteur TEXT, cree TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS anecdotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, titre TEXT, texte TEXT, image INTEGER, auteur TEXT, cree TEXT)`);
    // la borne de jeux (salle des fêtes) : fichiers découpés en morceaux de 1 Mo
    this.sql.exec(`CREATE TABLE IF NOT EXISTS jeux (id INTEGER PRIMARY KEY AUTOINCREMENT, titre TEXT, console TEXT, nom_fichier TEXT, taille INTEGER, morceaux INTEGER, complet INTEGER DEFAULT 0, cree TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS jeux_morceaux (jeu INTEGER, n INTEGER, data BLOB, PRIMARY KEY (jeu, n))`);
    // l'image collée sur la cartouche (jaquette réduite, en JPEG)
    try { this.sql.exec(`ALTER TABLE jeux ADD COLUMN jaquette TEXT`); } catch (e) { /* déjà là */ }
    this.sql.exec(`CREATE TABLE IF NOT EXISTS signalements (
      id INTEGER PRIMARY KEY AUTOINCREMENT, auteur TEXT, categorie TEXT, texte TEXT, appareil TEXT, cree TEXT, lu INTEGER DEFAULT 0, traite INTEGER DEFAULT 0)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, texte TEXT, image INTEGER, auteur TEXT, cree TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS aimes (publication INTEGER, auteur TEXT, PRIMARY KEY (publication, auteur))`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS commentaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT, cible TEXT, cible_id INTEGER, texte TEXT, auteur TEXT, cree TEXT)`);
    for (const col of ["code_hash TEXT", "mdp_hash TEXT", "setup TEXT", "essais INTEGER DEFAULT 0", "bloque_jusqua TEXT", "admin INTEGER DEFAULT 0", "photo TEXT",
      // chiffrement de bout en bout du courrier : clé publique, clé privée verrouillée par le code de liaison
      "cle_pub TEXT", "cle_privee TEXT", "liaison_hash TEXT",
      // validation des inscriptions par l'administrateur (les comptes déjà là restent validés)
      "statut TEXT DEFAULT 'valide'", "motif TEXT", "decide TEXT"]) {
      try { this.sql.exec(`ALTER TABLE membres ADD COLUMN ${col}`); } catch (e) { /* déjà là */ }
    }
  }

  /* ----- Administrateur -----
     Un seul administrateur : prénom et nom dans la configuration (ADMIN_PRENOM, ADMIN_NOM),
     mot de passe dans un secret Cloudflare (ADMIN_MOT_DE_PASSE), jamais dans le code. */
  estNomAdmin(prenom, nom) {
    const e = this.env;
    return !!(e.ADMIN_PRENOM && e.ADMIN_NOM && slug(prenom) === slug(e.ADMIN_PRENOM) && slug(nom) === slug(e.ADMIN_NOM));
  }
  async estAdmin(token) {
    if (!token) return false;
    if (((await this.ctx.storage.get("admin_sessions")) || []).includes(token)) return true;
    return !!this.sql.exec("SELECT 1 FROM membres WHERE token = ? AND admin = 1", token).toArray().length;
  }
  async exigerAdmin(token) {
    if (!(await this.estAdmin(token))) throw new Refus("Réservé à l'administrateur", 403);
  }
  async connexionAdmin(secret) {
    const attendu = this.env.ADMIN_MOT_DE_PASSE;
    // secret pas encore créé dans Cloudflare : on le dit, et on ne compte pas l'essai
    if (!attendu) throw new Refus("Connexion administrateur pas encore configurée (secret ADMIN_MOT_DE_PASSE manquant)", 503);
    const bloque = await this.ctx.storage.get("admin_bloque_v2");
    if (bloque && new Date(bloque) > new Date()) throw new Refus(`Trop d'essais : réessayez dans ${BLOCAGE_MIN} minutes`, 429);
    const a = new TextEncoder().encode(String(secret || "")), b = new TextEncoder().encode(String(attendu || ""));
    const ok = !!attendu && a.byteLength === b.byteLength && crypto.subtle.timingSafeEqual(a, b);
    if (!ok) {
      const essais = ((await this.ctx.storage.get("admin_essais_v2")) || 0) + 1;
      if (essais >= ESSAIS_MAX) {
        await this.ctx.storage.put("admin_bloque_v2", new Date(Date.now() + BLOCAGE_MIN * 60000).toISOString());
        await this.ctx.storage.put("admin_essais_v2", 0);
      } else await this.ctx.storage.put("admin_essais_v2", essais);
      throw new Refus("Prénom, nom ou mot de passe incorrect", 401);
    }
    await this.ctx.storage.put("admin_essais_v2", 0);
    // anciens compteurs (avant la v2) : on fait le ménage
    await this.ctx.storage.delete(["admin_bloque", "admin_essais"]);
    const m = this.sql.exec("SELECT * FROM membres WHERE admin = 1").toArray()[0];
    if (m) return { token: m.token, moi: this.public(m) };
    // pas encore de laissez-passer : session d'administrateur, il le fera au poste de police
    const token = "adm-" + crypto.randomUUID();
    const sessions = ((await this.ctx.storage.get("admin_sessions")) || []).slice(-4);
    await this.ctx.storage.put("admin_sessions", [...sessions, token]);
    return { token, moi: { admin: true, prenom: this.env.ADMIN_PRENOM, nom: String(this.env.ADMIN_NOM).toUpperCase(), numero: null, email: null } };
  }

  async supprimer(token, num) {
    await this.exigerAdmin(token);
    const m = this.sql.exec("SELECT * FROM membres WHERE numero = ?", Number(num)).toArray()[0];
    if (!m) throw new Refus("Membre introuvable", 404);
    if (m.admin) throw new Refus("Le compte de l'administrateur ne peut pas être supprimé");
    this.sql.exec("DELETE FROM messages WHERE de = ? OR a = ?", m.email, m.email);
    for (const [type, table] of Object.entries(TABLES)) {
      for (const x of this.sql.exec(`SELECT id, image FROM ${table} WHERE auteur = ?`, m.email).toArray()) {
        if (x.image) this.sql.exec("DELETE FROM images WHERE id = ?", x.image);
        this.sql.exec("DELETE FROM commentaires WHERE cible = ? AND cible_id = ?", type, x.id);
      }
      this.sql.exec(`DELETE FROM ${table} WHERE auteur = ?`, m.email);
    }
    this.sql.exec("DELETE FROM commentaires WHERE auteur = ?", m.email);
    this.sql.exec("DELETE FROM aimes WHERE auteur = ? OR publication NOT IN (SELECT id FROM publications)", m.email);
    this.sql.exec("DELETE FROM membres WHERE numero = ?", m.numero);
    return { ok: true };
  }

  async inscrire(fiche, token) {
    const nom = texte(fiche.nom, 40).toUpperCase(), prenom = texte(fiche.prenom, 40);
    if (!slug(nom) || !slug(prenom)) throw new Refus("Nom et prénom obligatoires");
    const admin = this.estNomAdmin(prenom, nom);
    if (admin && !(await this.estAdmin(token))) throw new Refus("Ce nom est réservé à l'administrateur : connectez-vous d'abord", 403);
    if (admin && this.sql.exec("SELECT 1 FROM membres WHERE admin = 1").toArray().length) throw new Refus("L'administrateur a déjà son laissez-passer");
    const qualite = QUALITES.includes(fiche.qualite) ? fiche.qualite : QUALITES[0];
    const parent = qualite === "Gendarme" ? nom : texte(fiche.parent, 40).toUpperCase() || nom;

    const n = ((await this.ctx.storage.get("dernier")) || 0) + 1;
    await this.ctx.storage.put("dernier", n);

    let email = `${slug(prenom)}.${slug(nom)}@${DOMAINE}`;
    if (this.sql.exec("SELECT 1 FROM membres WHERE email = ?", email).toArray().length) {
      email = `${slug(prenom)}.${slug(nom)}.${numero(n)}@${DOMAINE}`;
    }
    if (admin) {
      // l'administrateur se connecte avec son propre mot de passe : pas de code provisoire
      const jeton = crypto.randomUUID();
      this.sql.exec(`INSERT INTO membres (numero, nom, prenom, qualite, parent, email, token, cree, admin, photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`, n, nom, prenom, qualite, parent, email, jeton, new Date().toISOString(), photoValide(fiche.photo));
      await this.ctx.storage.delete("admin_sessions");
      return { token: jeton, moi: { numero: numero(n), email, nom, prenom, qualite, parent, admin: true, a_photo: !!photoValide(fiche.photo), cree: new Date().toISOString() } };
    }
    const code = codeProvisoire();
    this.sql.exec(`INSERT INTO membres (numero, nom, prenom, qualite, parent, email, token, cree, code_hash, photo, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'attente')`,
      n, nom, prenom, qualite, parent, email, crypto.randomUUID(), new Date().toISOString(), await hacher(code), photoValide(fiche.photo));
    // le code provisoire n'est donné qu'une fois, ici ; il sert à la première connexion
    return { numero: numero(n), email, code, nom, prenom, qualite, parent, a_photo: !!photoValide(fiche.photo), cree: new Date().toISOString() };
  }

  // Connexion : prénom + nom + mot de passe (ou code provisoire à la première connexion)
  async connexion({ prenom, nom, secret }) {
    if (this.estNomAdmin(prenom, nom)) return this.connexionAdmin(secret);
    const p = slug(prenom), n = slug(nom), maintenant = new Date();
    const candidats = this.sql.exec("SELECT * FROM membres").toArray().filter(m => slug(m.prenom) === p && slug(m.nom) === n);
    for (const m of candidats) {
      if (m.bloque_jusqua && new Date(m.bloque_jusqua) > maintenant) {
        throw new Refus(`Trop d'essais : réessayez dans ${BLOCAGE_MIN} minutes`, 429);
      }
    }
    for (const m of candidats) {
      if (m.mdp_hash && await verifier(secret, m.mdp_hash)) {
        this.sql.exec("UPDATE membres SET essais = 0, bloque_jusqua = NULL WHERE numero = ?", m.numero);
        return { token: m.token, moi: this.public(m) };
      }
      if (!m.mdp_hash && await verifier(secret, m.code_hash)) {
        const setup = crypto.randomUUID();
        this.sql.exec("UPDATE membres SET setup = ?, essais = 0, bloque_jusqua = NULL WHERE numero = ?", setup, m.numero);
        return { etape: "mot-de-passe", setup, prenom: m.prenom };
      }
    }
    for (const m of candidats) {
      const essais = (m.essais || 0) + 1;
      if (essais >= ESSAIS_MAX) {
        this.sql.exec("UPDATE membres SET essais = 0, bloque_jusqua = ? WHERE numero = ?",
          new Date(maintenant.getTime() + BLOCAGE_MIN * 60000).toISOString(), m.numero);
      } else this.sql.exec("UPDATE membres SET essais = ? WHERE numero = ?", essais, m.numero);
    }
    throw new Refus("Prénom, nom ou mot de passe incorrect", 401);
  }

  // Après le code provisoire : chacun choisit SON mot de passe
  async motDePasse({ setup, motdepasse }) {
    const m = setup && this.sql.exec("SELECT * FROM membres WHERE setup = ?", setup).toArray()[0];
    if (!m) throw new Refus("Session expirée : reconnectez-vous avec votre code provisoire", 401);
    const mdp = String(motdepasse || "");
    if (mdp.length < 8) throw new Refus("Le mot de passe doit faire au moins 8 caractères");
    const token = crypto.randomUUID();
    this.sql.exec("UPDATE membres SET mdp_hash = ?, code_hash = NULL, setup = NULL, token = ? WHERE numero = ?",
      await hacher(mdp), token, m.numero);
    return { token, moi: this.public(m) };
  }

  public(m) {
    return { numero: numero(m.numero), nom: m.nom, prenom: m.prenom, qualite: m.qualite, parent: m.parent, email: m.email,
      admin: !!m.admin, cree: m.cree, a_photo: m.a_photo !== undefined ? !!m.a_photo : !!m.photo,
      statut: m.statut || "valide", motif: m.motif || null };
  }

  // réservé aux anciens connectés (ou à l'administrateur avant son laissez-passer)
  async verifierAcces(token) {
    if (await this.estAdmin(token)) return;
    this.moi(token);
  }

  async membres(token) {
    await this.verifierAcces(token);
    const fr = new Intl.Collator("fr", { sensitivity: "base" });
    return this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, cree, admin, photo IS NOT NULL AS a_photo, cle_pub FROM membres WHERE statut IS NULL OR statut = 'valide'")
      .toArray().map(m => ({ ...m, numero: numero(m.numero), admin: !!m.admin, a_photo: !!m.a_photo }))
      .sort((a, b) => fr.compare(a.nom, b.nom) || fr.compare(a.prenom, b.prenom));
  }

  async photo(token, num) {
    // chacun voit sa propre photo, même en attente de validation
    let soi = false; try { soi = Number(this.moi(token, { tous: true }).numero) === Number(num); } catch (e) {}
    if (!soi) await this.verifierAcces(token);
    const m = this.sql.exec("SELECT photo FROM membres WHERE numero = ?", Number(num)).toArray()[0];
    return m && m.photo || null;
  }

  async changerPhoto(token, photo) {
    const moi = this.moi(token, { tous: true }), ok = photoValide(photo);
    if (!ok) throw new Refus("Photo invalide ou trop lourde");
    this.sql.exec("UPDATE membres SET photo = ? WHERE email = ?", ok, moi.email);
    return { ok: true };
  }

  // tous: true → aussi les comptes en attente ou refusés (pour leur statut, leur photo)
  moi(token, { tous = false } = {}) {
    const m = token && this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, admin, cree, photo IS NOT NULL AS a_photo, statut, motif FROM membres WHERE token = ?", token).toArray()[0];
    if (!m) {
      if (String(token).startsWith("adm-")) throw new Refus("Fais d'abord ton laissez-passer au poste de police", 403);
      throw new Refus("Laissez-passer inconnu", 401);
    }
    if (!tous && (m.statut || "valide") !== "valide") throw new Refus("Compte en attente de validation", 403);
    return this.public(m);
  }

  /* ----- La borne de jeux : l'administrateur seul ajoute ou retire ----- */
  async jeux(token) {
    await this.verifierAcces(token);
    return this.sql.exec("SELECT id, titre, console, nom_fichier, taille, cree, jaquette FROM jeux WHERE complet = 1 ORDER BY titre COLLATE NOCASE").toArray();
  }
  async nouveauJeu(token, x) {
    await this.exigerAdmin(token);
    const CONSOLES = ["snes", "nes", "gb", "gba", "segaMD", "segaMS", "segaGG", "n64", "atari2600", "pce"];
    const titre = texte(x.titre, 80), taille = Number(x.taille), morceaux = Math.ceil(taille / MORCEAU);
    if (!titre) throw new Refus("Donne un titre au jeu");
    if (!CONSOLES.includes(x.console)) throw new Refus("Console inconnue");
    if (!(taille > 0 && taille <= JEU_MAX)) throw new Refus("Fichier trop lourd (32 Mo maximum)");
    this.sql.exec("INSERT INTO jeux (titre, console, nom_fichier, taille, morceaux, cree, jaquette) VALUES (?, ?, ?, ?, ?, ?, ?)",
      titre, x.console, texte(x.nom_fichier, 120).replace(/[^\w.\- ]/g, "_") || "jeu.bin", taille, morceaux, new Date().toISOString(), jaquette(x.jaquette));
    return { id: this.sql.exec("SELECT last_insert_rowid() AS id").one().id, morceaux, taille_morceau: MORCEAU };
  }
  async morceauJeu(token, id, n, data) {
    await this.exigerAdmin(token);
    const j = this.sql.exec("SELECT * FROM jeux WHERE id = ?", Number(id)).toArray()[0];
    if (!j) throw new Refus("Jeu introuvable", 404);
    n = Number(n);
    if (!(n >= 0 && n < j.morceaux) || data.byteLength > MORCEAU) throw new Refus("Morceau invalide");
    this.sql.exec("INSERT OR REPLACE INTO jeux_morceaux (jeu, n, data) VALUES (?, ?, ?)", j.id, n, data);
    const recus = this.sql.exec("SELECT COUNT(*) AS c FROM jeux_morceaux WHERE jeu = ?", j.id).one().c;
    if (recus === j.morceaux) this.sql.exec("UPDATE jeux SET complet = 1 WHERE id = ?", j.id);
    return { ok: true, complet: recus === j.morceaux };
  }
  async fichierJeu(token, id) {
    await this.verifierAcces(token);
    const j = this.sql.exec("SELECT * FROM jeux WHERE id = ? AND complet = 1", Number(id)).toArray()[0];
    if (!j) return null;
    const out = new Uint8Array(j.taille); let pos = 0;
    for (const m of this.sql.exec("SELECT data FROM jeux_morceaux WHERE jeu = ? ORDER BY n", j.id).toArray()) {
      const b = new Uint8Array(m.data); out.set(b, pos); pos += b.byteLength;
    }
    return { octets: out, nom: j.nom_fichier };
  }
  async jaquetteJeu(token, id, x) {
    await this.exigerAdmin(token);
    this.sql.exec("UPDATE jeux SET jaquette = ? WHERE id = ?", jaquette(x.jaquette), Number(id));
    return { ok: true };
  }
  async retirerJeu(token, id) {
    await this.exigerAdmin(token);
    this.sql.exec("DELETE FROM jeux_morceaux WHERE jeu = ?", Number(id));
    this.sql.exec("DELETE FROM jeux WHERE id = ?", Number(id));
    return { ok: true };
  }

  /* ----- Validation des inscriptions par l'administrateur ----- */
  statut(token) { return this.moi(token, { tous: true }); }
  async demandes(token) {
    await this.exigerAdmin(token);
    return this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, cree, photo IS NOT NULL AS a_photo FROM membres WHERE statut = 'attente' AND mdp_hash IS NOT NULL ORDER BY numero")
      .toArray().map(m => ({ ...m, numero: numero(m.numero), a_photo: !!m.a_photo }));
  }
  async decider(token, num, x) {
    await this.exigerAdmin(token);
    const m = this.sql.exec("SELECT numero, statut FROM membres WHERE numero = ?", Number(num)).toArray()[0];
    if (!m) throw new Refus("Membre introuvable", 404);
    if (x.decision === "valider") this.sql.exec("UPDATE membres SET statut = 'valide', motif = NULL, decide = ? WHERE numero = ?", new Date().toISOString(), m.numero);
    else if (x.decision === "refuser") this.sql.exec("UPDATE membres SET statut = 'refuse', motif = ?, decide = ? WHERE numero = ?", texte(x.motif, 1000) || null, new Date().toISOString(), m.numero);
    else throw new Refus("Décision inconnue");
    return { ok: true };
  }
  // demande refusée : le demandeur peut effacer sa demande pour en refaire une
  async abandonner(token) {
    const moi = this.moi(token, { tous: true });
    if (moi.statut !== "refuse") throw new Refus("Seule une demande refusée peut être retirée");
    this.sql.exec("DELETE FROM membres WHERE email = ?", moi.email);
    return { ok: true };
  }

  async boite(token) {
    const moi = this.moi(token);
    const liste = col => this.sql.exec(`SELECT id, de, a, sujet, texte, envoye, lu, chiffre FROM messages WHERE ${col} = ? ORDER BY id DESC LIMIT 200`, moi.email).toArray();
    return { moi, recus: liste("a"), envoyes: liste("de") };
  }

  async envoyer(token, lettre) {
    const moi = this.moi(token);
    const a = texte(lettre.a, 120).toLowerCase();
    if (!this.sql.exec("SELECT 1 FROM membres WHERE email = ?", a).toArray().length) throw new Refus("Destinataire inconnu");
    if (lettre.chiffre) {
      // message chiffré de bout en bout : le serveur ne garde qu'un contenu illisible
      const c = lettre.chiffre;
      if (typeof c.iv !== "string" || typeof c.ct !== "string" || typeof c.cle !== "string" || c.ct.length > 40000) throw new Refus("Message chiffré invalide");
      this.sql.exec("INSERT INTO messages (de, a, sujet, texte, envoye, chiffre) VALUES (?, ?, ?, ?, ?, ?)",
        moi.email, a, "🔒", "", new Date().toISOString(), JSON.stringify({ iv: c.iv, ct: c.ct, cle: c.cle }));
      return { ok: true };
    }
    const sujet = texte(lettre.sujet, 120) || "(sans objet)", corps = texte(lettre.texte, 5000);
    if (!corps) throw new Refus("Le message est vide");
    this.sql.exec("INSERT INTO messages (de, a, sujet, texte, envoye) VALUES (?, ?, ?, ?, ?)", moi.email, a, sujet, corps, new Date().toISOString());
    return { ok: true };
  }

  /* ----- Clés du courrier chiffré et code de liaison (verso de la carte) -----
     Le code de liaison ne quitte jamais l'appareil : le serveur ne reçoit que
     - la clé privée verrouillée par ce code (illisible sans lui),
     - une « preuve » dérivée du code, qu'il garde chiffrée de façon irréversible. */
  async mesCles(token) {
    const moi = this.moi(token);
    const m = this.sql.exec("SELECT cle_pub, cle_privee FROM membres WHERE email = ?", moi.email).toArray()[0];
    return { cle_pub: m.cle_pub || null, cle_privee: m.cle_privee ? JSON.parse(m.cle_privee) : null };
  }
  async enregistrerCles(token, x) {
    const moi = this.moi(token);
    const m = this.sql.exec("SELECT cle_pub FROM membres WHERE email = ?", moi.email).toArray()[0];
    if (m.cle_pub) throw new Refus("Les clés de ce compte existent déjà");
    const ok = typeof x.cle_pub === "string" && x.cle_pub.length < 2000 && x.cle_privee && typeof x.cle_privee.ct === "string"
      && typeof x.preuve === "string" && /^[0-9a-f]{64}$/.test(x.preuve);
    if (!ok) throw new Refus("Clés invalides");
    this.sql.exec("UPDATE membres SET cle_pub = ?, cle_privee = ?, liaison_hash = ? WHERE email = ?",
      x.cle_pub, JSON.stringify(x.cle_privee), await hacher(x.preuve), moi.email);
    return { ok: true };
  }
  // changer son code de liaison : la même clé privée, reverrouillée avec le nouveau code
  async changerCode(token, x) {
    const moi = this.moi(token);
    const ok = x.cle_privee && typeof x.cle_privee.ct === "string" && typeof x.preuve === "string" && /^[0-9a-f]{64}$/.test(x.preuve);
    if (!ok) throw new Refus("Code invalide");
    if (!this.sql.exec("SELECT 1 FROM membres WHERE email = ? AND cle_pub IS NOT NULL", moi.email).toArray().length) throw new Refus("Pas encore de clés sur ce compte");
    this.sql.exec("UPDATE membres SET cle_privee = ?, liaison_hash = ? WHERE email = ?", JSON.stringify(x.cle_privee), await hacher(x.preuve), moi.email);
    return { ok: true };
  }

  /* ----- Signalements : « un problème ? » → boîte que seul l'administrateur voit ----- */
  async signaler(token, x) {
    const moi = this.moi(token);
    const CATS = ["Connexion", "Laissez-passer", "Courrier", "Photos et publications", "Affichage", "Autre"];
    const t = texte(x.texte, 4000); if (!t) throw new Refus("Décris ton problème");
    this.sql.exec("INSERT INTO signalements (auteur, categorie, texte, appareil, cree) VALUES (?, ?, ?, ?, ?)",
      moi.email, CATS.includes(x.categorie) ? x.categorie : "Autre", t, texte(x.appareil, 300), new Date().toISOString());
    return { ok: true };
  }
  async signalements(token) {
    await this.exigerAdmin(token);
    const qui = this.auteurs();
    return this.sql.exec("SELECT * FROM signalements ORDER BY traite, id DESC LIMIT 300").toArray().map(x => ({ ...x, de: qui(x.auteur) }));
  }
  async majSignalement(token, id, x) {
    await this.exigerAdmin(token);
    if (x.lu) this.sql.exec("UPDATE signalements SET lu = 1 WHERE id = ?", Number(id));
    if (x.traite !== undefined) this.sql.exec("UPDATE signalements SET traite = ?, lu = 1 WHERE id = ?", x.traite ? 1 : 0, Number(id));
    return { ok: true };
  }

  // connexion d'un deuxième écran avec le code du verso (prénom + nom + preuve du code)
  async liaison({ prenom, nom, preuve }) {
    const p = slug(prenom), n = slug(nom), maintenant = new Date();
    const candidats = this.sql.exec("SELECT * FROM membres WHERE liaison_hash IS NOT NULL").toArray().filter(m => slug(m.prenom) === p && slug(m.nom) === n);
    for (const m of candidats) {
      if (m.bloque_jusqua && new Date(m.bloque_jusqua) > maintenant) throw new Refus(`Trop d'essais : réessayez dans ${BLOCAGE_MIN} minutes`, 429);
    }
    for (const m of candidats) {
      if (await verifier(preuve, m.liaison_hash)) {
        this.sql.exec("UPDATE membres SET essais = 0, bloque_jusqua = NULL WHERE numero = ?", m.numero);
        return { token: m.token, moi: this.public(m), cle_privee: JSON.parse(m.cle_privee) };
      }
    }
    for (const m of candidats) {
      const essais = (m.essais || 0) + 1;
      if (essais >= ESSAIS_MAX) this.sql.exec("UPDATE membres SET essais = 0, bloque_jusqua = ? WHERE numero = ?", new Date(maintenant.getTime() + BLOCAGE_MIN * 60000).toISOString(), m.numero);
      else this.sql.exec("UPDATE membres SET essais = ? WHERE numero = ?", essais, m.numero);
    }
    throw new Refus("Prénom, nom ou code de liaison incorrect", 401);
  }

  /* ----- Bibliothèque, anecdotes, commentaires : partagés entre tous les appareils ----- */
  auteurs() {
    const m = {};
    for (const x of this.sql.exec("SELECT email, prenom, nom, numero FROM membres").toArray()) m[x.email] = x;
    return e => { const a = m[e]; return a ? { nom: `${a.prenom} ${a.nom.charAt(0)}.`, ini: (a.prenom[0] + a.nom[0]).toUpperCase(), numero: numero(a.numero) } : { nom: "Ancien membre", ini: "?", numero: null }; };
  }
  commentairesDe(cible, id, qui) {
    return this.sql.exec("SELECT id, texte, auteur, cree FROM commentaires WHERE cible = ? AND cible_id = ? ORDER BY id", cible, id).toArray()
      .map(c => ({ id: c.id, texte: c.texte, cree: c.cree, de: qui(c.auteur) }));
  }
  garderImage(data) {
    const ok = imageValide(data); if (!ok) return null;
    this.sql.exec("INSERT INTO images (data) VALUES (?)", ok);
    return this.sql.exec("SELECT last_insert_rowid() AS id").one().id;
  }
  image(token, id) {
    this.moi(token);
    const x = this.sql.exec("SELECT data FROM images WHERE id = ?", Number(id)).toArray()[0];
    return x ? x.data : null;
  }
  async bibliotheque(token) {
    this.moi(token); const qui = this.auteurs();
    return this.sql.exec("SELECT * FROM photos ORDER BY id DESC").toArray().map(p => ({
      id: p.id, titre: p.titre, theme: p.theme, annee: p.annee, image: p.image, cree: p.cree,
      de: qui(p.auteur), mien: p.auteur, commentaires: this.commentairesDe("photo", p.id, qui) }));
  }
  async deposerPhoto(token, x) {
    const moi = this.moi(token);
    const titre = texte(x.titre, 120), theme = texte(x.theme, 40);
    if (!titre || !theme) throw new Refus("Titre et thème obligatoires");
    const img = this.garderImage(x.image); if (!img) throw new Refus("Photo invalide ou trop lourde");
    this.sql.exec("INSERT INTO photos (titre, theme, annee, image, auteur, cree) VALUES (?, ?, ?, ?, ?, ?)",
      titre, theme.charAt(0).toUpperCase() + theme.slice(1), texte(x.annee, 20), img, moi.email, new Date().toISOString());
    return { ok: true };
  }
  async anecdotes(token) {
    this.moi(token); const qui = this.auteurs();
    return this.sql.exec("SELECT * FROM anecdotes ORDER BY id DESC").toArray().map(a => ({
      id: a.id, titre: a.titre, texte: a.texte, image: a.image, cree: a.cree,
      de: qui(a.auteur), mien: a.auteur, commentaires: this.commentairesDe("anecdote", a.id, qui) }));
  }
  async raconter(token, x) {
    const moi = this.moi(token);
    const titre = texte(x.titre, 120), corps = texte(x.texte, 10000);
    if (!titre || !corps) throw new Refus("Titre et histoire obligatoires");
    const img = x.image ? this.garderImage(x.image) : null;
    if (x.image && !img) throw new Refus("Image invalide ou trop lourde");
    this.sql.exec("INSERT INTO anecdotes (titre, texte, image, auteur, cree) VALUES (?, ?, ?, ?, ?)", titre, corps, img, moi.email, new Date().toISOString());
    return { ok: true };
  }
  async commenter(token, x) {
    const moi = this.moi(token);
    const cible = TABLES[x.cible];
    if (!cible) throw new Refus("Cible inconnue");
    if (!this.sql.exec(`SELECT 1 FROM ${cible} WHERE id = ?`, Number(x.id)).toArray().length) throw new Refus("Introuvable", 404);
    const t = texte(x.texte, 2000); if (!t) throw new Refus("Commentaire vide");
    this.sql.exec("INSERT INTO commentaires (cible, cible_id, texte, auteur, cree) VALUES (?, ?, ?, ?, ?)", x.cible, Number(x.id), t, moi.email, new Date().toISOString());
    return { ok: true };
  }
  // retirer une photo, une anecdote ou une publication : son auteur ou l'administrateur
  async retirer(token, type, id) {
    const moi = this.moi(token), table = TABLES[type];
    if (!table) throw new Refus("Type inconnu");
    const x = this.sql.exec(`SELECT * FROM ${table} WHERE id = ?`, Number(id)).toArray()[0];
    if (!x) throw new Refus("Introuvable", 404);
    if (x.auteur !== moi.email && !moi.admin) throw new Refus("Réservé à l'auteur ou à l'administrateur", 403);
    if (x.image) this.sql.exec("DELETE FROM images WHERE id = ?", x.image);
    this.sql.exec("DELETE FROM commentaires WHERE cible = ? AND cible_id = ?", type, x.id);
    if (type === "publication") this.sql.exec("DELETE FROM aimes WHERE publication = ?", x.id);
    this.sql.exec(`DELETE FROM ${table} WHERE id = ?`, x.id);
    return { ok: true };
  }

  /* ----- Le fil des publications (façon mur) ----- */
  async publications(token) {
    const moi = this.moi(token), qui = this.auteurs();
    const nb = {}, mes = new Set();
    for (const a of this.sql.exec("SELECT publication, auteur FROM aimes").toArray()) {
      nb[a.publication] = (nb[a.publication] || 0) + 1;
      if (a.auteur === moi.email) mes.add(a.publication);
    }
    return this.sql.exec("SELECT * FROM publications ORDER BY id DESC LIMIT 100").toArray().map(p => ({
      id: p.id, texte: p.texte, image: p.image, cree: p.cree, de: qui(p.auteur), mien: p.auteur,
      aimes: nb[p.id] || 0, jaime: mes.has(p.id), commentaires: this.commentairesDe("publication", p.id, qui) }));
  }
  async publier(token, x) {
    const moi = this.moi(token), t = texte(x.texte, 5000);
    const img = x.image ? this.garderImage(x.image) : null;
    if (x.image && !img) throw new Refus("Image invalide ou trop lourde");
    if (!t && !img) throw new Refus("Écris quelque chose ou ajoute une photo");
    this.sql.exec("INSERT INTO publications (texte, image, auteur, cree) VALUES (?, ?, ?, ?)", t, img, moi.email, new Date().toISOString());
    return { ok: true };
  }
  async aimer(token, id) {
    const moi = this.moi(token), n = Number(id);
    if (!this.sql.exec("SELECT 1 FROM publications WHERE id = ?", n).toArray().length) throw new Refus("Introuvable", 404);
    if (this.sql.exec("SELECT 1 FROM aimes WHERE publication = ? AND auteur = ?", n, moi.email).toArray().length)
      this.sql.exec("DELETE FROM aimes WHERE publication = ? AND auteur = ?", n, moi.email);
    else this.sql.exec("INSERT INTO aimes (publication, auteur) VALUES (?, ?)", n, moi.email);
    return { ok: true };
  }

  async marquerLu(token, id) {
    const moi = this.moi(token);
    this.sql.exec("UPDATE messages SET lu = 1 WHERE id = ? AND a = ?", Number(id), moi.email);
    return { ok: true };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    const registre = env.COMPTEUR.get(env.COMPTEUR.idFromName("caserne"));
    const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const corps = async () => { try { return await request.json(); } catch { return {}; } };
    const route = `${request.method} ${url.pathname}`;

    // photo d'identité d'un membre (image)
    if (request.method === "GET" && /^\/api\/photo\/\d+$/.test(url.pathname)) {
      let data;
      try { data = await registre.photo(url.searchParams.get("t") || "", url.pathname.split("/")[3]); }
      catch (e) { return new Response("Connexion requise", { status: 401 }); }
      if (!data) return new Response("Pas de photo", { status: 404 });
      const bin = Uint8Array.from(atob(data.split(",")[1]), c => c.charCodeAt(0));
      return new Response(bin, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=300" } });
    }

    // image partagée (une balise <img> ne peut pas envoyer d'en-tête : jeton dans l'adresse)
    if (request.method === "GET" && /^\/api\/image\/\d+$/.test(url.pathname)) {
      try {
        const data = await registre.image(url.searchParams.get("t") || "", url.pathname.split("/")[3]);
        if (!data) return new Response("Introuvable", { status: 404 });
        const bin = Uint8Array.from(atob(data.split(",")[1]), c => c.charCodeAt(0));
        return new Response(bin, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" } });
      } catch (e) { return new Response("Connexion requise", { status: 401 }); }
    }

    // météo à la caserne (Open-Meteo, gratuit, sans clé), gardée 15 minutes en cache
    if (route === "GET /api/meteo") {
      const cache = caches.default, cle = new Request("https://caserne-nf/meteo");
      let res = await cache.match(cle);
      if (!res) {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=48.8767&longitude=2.3488"
          + "&current=temperature_2m,weather_code,wind_speed_10m,apparent_temperature"
          + "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FParis&forecast_days=4");
        if (!r.ok) return Response.json({ erreur: "Météo indisponible" }, { status: 502 });
        res = new Response(await r.text(), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=900" } });
        await cache.put(cle, res.clone());
      }
      return res;
    }

    // fichier d'un jeu de la borne (réservé aux anciens validés)
    if (request.method === "GET" && /^\/api\/jeux\/\d+\/fichier$/.test(url.pathname)) {
      try {
        const f = await registre.fichierJeu(url.searchParams.get("t") || "", url.pathname.split("/")[3]);
        if (!f) return new Response("Introuvable", { status: 404 });
        return new Response(f.octets, { headers: { "Content-Type": "application/octet-stream", "Cache-Control": "private, max-age=86400",
          "Content-Disposition": `inline; filename="${f.nom}"` } });
      } catch (e) { return new Response("Connexion requise", { status: 401 }); }
    }
    // dépôt d'un morceau de jeu (administrateur)
    if (request.method === "PUT" && /^\/api\/jeux\/\d+\/morceau\/\d+$/.test(url.pathname)) {
      const [, , , id, , n] = url.pathname.split("/");
      try { return Response.json(await registre.morceauJeu(token, id, n, await request.arrayBuffer())); }
      catch (e) { return Response.json({ erreur: e.message }, { status: e.status || (/Réservé/.test(e.message) ? 403 : 400) }); }
    }

    try {
      let r;
      if (route === "POST /api/inscription") r = await registre.inscrire(await corps(), token);
      else if (route === "POST /api/connexion") r = await registre.connexion(await corps());
      else if (route === "POST /api/mot-de-passe") r = await registre.motDePasse(await corps());
      else if (route === "POST /api/liaison") r = await registre.liaison(await corps());
      else if (route === "GET /api/cles") r = await registre.mesCles(token);
      else if (route === "POST /api/cles") r = await registre.enregistrerCles(token, await corps());
      else if (route === "PUT /api/cles/code") r = await registre.changerCode(token, await corps());
      else if (route === "POST /api/signalements") r = await registre.signaler(token, await corps());
      else if (route === "GET /api/signalements") r = await registre.signalements(token);
      else if (route === "GET /api/statut") r = await registre.statut(token);
      else if (route === "GET /api/jeux") r = await registre.jeux(token);
      else if (route === "POST /api/jeux") r = await registre.nouveauJeu(token, await corps());
      else if (request.method === "PUT" && /^\/api\/jeux\/\d+\/jaquette$/.test(url.pathname)) r = await registre.jaquetteJeu(token, url.pathname.split("/")[3], await corps());
      else if (request.method === "DELETE" && /^\/api\/jeux\/\d+$/.test(url.pathname)) r = await registre.retirerJeu(token, url.pathname.split("/")[3]);
      else if (route === "GET /api/demandes") r = await registre.demandes(token);
      else if (request.method === "POST" && /^\/api\/demandes\/\d+$/.test(url.pathname)) r = await registre.decider(token, url.pathname.split("/")[3], await corps());
      else if (route === "POST /api/moi/abandon") r = await registre.abandonner(token);
      else if (request.method === "POST" && /^\/api\/signalements\/\d+$/.test(url.pathname)) r = await registre.majSignalement(token, url.pathname.split("/")[3], await corps());
      else if (route === "GET /api/membres") r = await registre.membres(token);
      else if (route === "GET /api/bibliotheque") r = await registre.bibliotheque(token);
      else if (route === "POST /api/bibliotheque") r = await registre.deposerPhoto(token, await corps());
      else if (route === "GET /api/anecdotes") r = await registre.anecdotes(token);
      else if (route === "POST /api/anecdotes") r = await registre.raconter(token, await corps());
      else if (route === "POST /api/commentaires") r = await registre.commenter(token, await corps());
      else if (route === "GET /api/publications") r = await registre.publications(token);
      else if (route === "POST /api/publications") r = await registre.publier(token, await corps());
      else if (request.method === "POST" && /^\/api\/publications\/\d+\/aime$/.test(url.pathname)) r = await registre.aimer(token, url.pathname.split("/")[3]);
      else if (request.method === "DELETE" && /^\/api\/(photo|anecdote|publication)\/\d+$/.test(url.pathname)) {
        const [, , type, id] = url.pathname.split("/"); r = await registre.retirer(token, type, id);
      }
      else if (route === "PUT /api/moi/photo") r = await registre.changerPhoto(token, (await corps()).photo);
      else if (route === "GET /api/boite") r = await registre.boite(token);
      else if (route === "POST /api/messages") r = await registre.envoyer(token, await corps());
      else if (request.method === "DELETE" && /^\/api\/membres\/\d+$/.test(url.pathname)) r = await registre.supprimer(token, url.pathname.split("/")[3]);
      else if (request.method === "POST" && /^\/api\/messages\/\d+\/lu$/.test(url.pathname)) r = await registre.marquerLu(token, url.pathname.split("/")[3]);
      else return Response.json({ erreur: "Introuvable" }, { status: 404 });
      return Response.json(r);
    } catch (e) {
      // les erreurs traversent le Durable Object sans leur classe : on retrouve le statut par le message
      const m = e.message || "";
      const status = e.status || (/Laissez-passer inconnu|incorrect|Session expirée/.test(m) ? 401
        : /existent déjà/.test(m) ? 409
        : /en attente de validation/.test(m) ? 403
        : /Trop d'essais/.test(m) ? 429 : /réservé|Réservé|Fais d'abord/.test(m) ? 403 : /introuvable/.test(m) ? 404
        : /pas encore configurée/.test(m) ? 503 : 400);
      return Response.json({ erreur: e.message || "Erreur" }, { status });
    }
  },
};
