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

// escalier : une lettre de A à Z, sauf Q, T, U, V et W (ces escaliers n'existaient pas à la caserne) ; étage : 0 (rez-de-chaussée) à 7 (7 étages au plus)
const ESCALIERS = "ABCDEFGHIJKLMNOPRSXYZ";
const batValide = v => { const l = String(v || "").trim().toUpperCase(); return l.length === 1 && ESCALIERS.includes(l) ? l : null; };
const etageValide = v => { if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 7 ? n : null; };
const LIEUX_MATRICE = ["rue", "grande", "fetes"];
const DITS_DUREE = 3600e3;   // les messages de la Matrice sont effacés au bout d'une heure
const MUSIQUE_MAX = 50 * 1024 * 1024, DISCO_MAX = 2 * 1024 * 1024 * 1024;
const TENUES_MATRICE = ["garde", "civil", "tshirt", "polo", "survet", "robe", "costume"];
const hexa = (v, d) => /^#[0-9a-f]{6}$/i.test(v || "") ? v : d;
const texte_ = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
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
    // la discothèque du DJ : musiques déposées par les anciens, en morceaux de 1 Mo
    this.sql.exec(`CREATE TABLE IF NOT EXISTS musiques (id INTEGER PRIMARY KEY AUTOINCREMENT, titre TEXT, artiste TEXT, auteur INTEGER, auteur_nom TEXT, type TEXT, taille INTEGER, morceaux INTEGER, complet INTEGER DEFAULT 0, duree REAL, cree TEXT)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS musiques_morceaux (m INTEGER, n INTEGER, data BLOB, PRIMARY KEY (m, n))`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS jeux_morceaux (jeu INTEGER, n INTEGER, data BLOB, PRIMARY KEY (jeu, n))`);
    // l'image collée sur la cartouche (jaquette réduite, en JPEG)
    try { this.sql.exec(`ALTER TABLE jeux ADD COLUMN jaquette TEXT`); } catch (e) { /* déjà là */ }
    // la Matrice : ce qui s'est dit dans chaque lieu (les 50 derniers), et les sanctions de l'administrateur
    this.sql.exec(`CREATE TABLE IF NOT EXISTS matrice_dits (id INTEGER PRIMARY KEY AUTOINCREMENT, lieu TEXT, numero INTEGER, nom TEXT, texte TEXT, cree TEXT)`);
    // le bonhomme du chef de poste (le père de l'administrateur), réglé par l'administrateur
    this.sql.exec(`CREATE TABLE IF NOT EXISTS pnj (id INTEGER PRIMARY KEY, nom TEXT, tenue TEXT, couleur TEXT, reglage TEXT, tete TEXT, v INTEGER DEFAULT 0)`);
    for (const col of ["bas TEXT", "pieds TEXT"]) { try { this.sql.exec(`ALTER TABLE pnj ADD COLUMN ${col}`); } catch (e) { /* déjà là */ } }
    this.sql.exec(`CREATE TABLE IF NOT EXISTS matrice_sanctions (numero INTEGER PRIMARY KEY, muet_jusqua TEXT, exclu_jusqua TEXT)`);
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
      "statut TEXT DEFAULT 'valide'", "motif TEXT", "decide TEXT",
      // l'escalier (lettre A à Z) et l'étage où l'ancien a vécu ses meilleurs moments
      "bat TEXT", "etage INTEGER",
      // le bonhomme de la Matrice : tenue, couleur, tête détourée (PNG), version (pour le cache)
      "av_tenue TEXT", "av_couleur TEXT", "av_tete TEXT", "av_v INTEGER DEFAULT 0", "av_reglage TEXT", "av_bas TEXT", "av_pieds TEXT"]) {
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
    const bat = batValide(fiche.bat), etage = bat ? etageValide(fiche.etage) : null;

    const n = ((await this.ctx.storage.get("dernier")) || 0) + 1;
    await this.ctx.storage.put("dernier", n);

    let email = `${slug(prenom)}.${slug(nom)}@${DOMAINE}`;
    if (this.sql.exec("SELECT 1 FROM membres WHERE email = ?", email).toArray().length) {
      email = `${slug(prenom)}.${slug(nom)}.${numero(n)}@${DOMAINE}`;
    }
    if (admin) {
      // l'administrateur se connecte avec son propre mot de passe : pas de code provisoire
      const jeton = crypto.randomUUID();
      this.sql.exec(`INSERT INTO membres (numero, nom, prenom, qualite, parent, email, token, cree, admin, photo, bat, etage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`, n, nom, prenom, qualite, parent, email, jeton, new Date().toISOString(), photoValide(fiche.photo), bat, etage);
      await this.ctx.storage.delete("admin_sessions");
      return { token: jeton, moi: { numero: numero(n), email, nom, prenom, qualite, parent, bat, etage, admin: true, a_photo: !!photoValide(fiche.photo), cree: new Date().toISOString() } };
    }
    const code = codeProvisoire();
    this.sql.exec(`INSERT INTO membres (numero, nom, prenom, qualite, parent, email, token, cree, code_hash, photo, statut, bat, etage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'attente', ?, ?)`,
      n, nom, prenom, qualite, parent, email, crypto.randomUUID(), new Date().toISOString(), await hacher(code), photoValide(fiche.photo), bat, etage);
    // le code provisoire n'est donné qu'une fois, ici ; il sert à la première connexion
    return { numero: numero(n), email, code, nom, prenom, qualite, parent, bat, etage, a_photo: !!photoValide(fiche.photo), cree: new Date().toISOString() };
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
      statut: m.statut || "valide", motif: m.motif || null, bat: m.bat || null, etage: m.etage ?? null };
  }

  // réservé aux anciens connectés (ou à l'administrateur avant son laissez-passer)
  async verifierAcces(token) {
    if (await this.estAdmin(token)) return;
    this.moi(token);
  }

  async membres(token) {
    await this.verifierAcces(token);
    const fr = new Intl.Collator("fr", { sensitivity: "base" });
    return this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, cree, admin, photo IS NOT NULL AS a_photo, cle_pub, bat, etage FROM membres WHERE statut IS NULL OR statut = 'valide'")
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

  /* ----- La Matrice : le bonhomme ----- */
  infoPNJ(token) {
    this.moi(token);
    const p = this.sql.exec("SELECT nom, tenue, couleur, bas, pieds, reglage, tete IS NOT NULL AS a_tete, v FROM pnj WHERE id = 1").toArray()[0];
    let reglage = null; try { reglage = p && JSON.parse(p.reglage); } catch (e) {}
    return { nom: (p && p.nom) || "Le chef de poste", tenue: (p && p.tenue) || "garde", couleur: (p && p.couleur) || "#1c2541", bas: (p && p.bas) || null, pieds: (p && p.pieds) || null, reglage, tete_v: p && p.a_tete ? p.v : 0 };
  }
  tetePNJ(token) { this.moi(token); const p = this.sql.exec("SELECT tete FROM pnj WHERE id = 1").toArray()[0]; return p && p.tete; }
  async changerPNJ(token, x) {
    await this.exigerAdmin(token);
    const tenue = TENUES_MATRICE.includes(x.tenue) ? x.tenue : "garde", couleur = /^#[0-9a-f]{6}$/i.test(x.couleur || "") ? x.couleur : "#1c2541";
    const nom = texte(x.nom, 40) || "Le chef de poste";
    const borne = (v, a, b, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : d; };
    const R = x.reglage || {}, reglage = JSON.stringify({ k: borne(R.k, .4, 2.5, 1), dx: borne(R.dx, -80, 80, 0), dy: borne(R.dy, -80, 80, 0), r: borne(R.r, -45, 45, 0) });
    if (!this.sql.exec("SELECT 1 FROM pnj WHERE id = 1").toArray().length) this.sql.exec("INSERT INTO pnj (id, v) VALUES (1, 0)");
    this.sql.exec("UPDATE pnj SET nom = ?, tenue = ?, couleur = ?, bas = ?, pieds = ?, reglage = ?, v = v + 1 WHERE id = 1", nom, tenue, couleur, hexa(x.bas, null), hexa(x.pieds, null), reglage);
    if (x.tete === null) this.sql.exec("UPDATE pnj SET tete = NULL WHERE id = 1");
    else if (x.tete !== undefined) {
      if (typeof x.tete !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(x.tete) || x.tete.length > 200000) throw new Refus("Tête invalide ou trop lourde");
      this.sql.exec("UPDATE pnj SET tete = ? WHERE id = 1", x.tete);
    }
    const info = this.infoPNJ(token), t = JSON.stringify({ t: "pnj", p: info });
    for (const ws of this.ctx.getWebSockets()) { try { ws.send(t); } catch (e) {} }
    return info;
  }

  async changerAvatar(token, x) {
    const moi = this.moi(token);
    const tenue = TENUES_MATRICE.includes(x.tenue) ? x.tenue : "civil";
    const couleur = /^#[0-9a-f]{6}$/i.test(x.couleur || "") ? x.couleur : "#22324f";
    const borne = (v, a, b, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : d; };
    const R = x.reglage || {}, reglage = JSON.stringify({ k: borne(R.k, .4, 2.5, 1), dx: borne(R.dx, -80, 80, 0), dy: borne(R.dy, -80, 80, 0), r: borne(R.r, -45, 45, 0) });
    let tete;
    if (x.tete === null) tete = null;
    else if (x.tete !== undefined) {
      if (typeof x.tete !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(x.tete) || x.tete.length > 200000) throw new Refus("Tête invalide ou trop lourde");
      tete = x.tete;
    }
    this.sql.exec("UPDATE membres SET av_bas = ?, av_pieds = ? WHERE email = ?", hexa(x.bas, null), hexa(x.pieds, null), moi.email);
    if (tete === undefined) this.sql.exec("UPDATE membres SET av_tenue = ?, av_couleur = ?, av_reglage = ?, av_v = COALESCE(av_v, 0) + 1 WHERE email = ?", tenue, couleur, reglage, moi.email);
    else this.sql.exec("UPDATE membres SET av_tenue = ?, av_couleur = ?, av_reglage = ?, av_tete = ?, av_v = COALESCE(av_v, 0) + 1 WHERE email = ?", tenue, couleur, reglage, tete, moi.email);
    const p = this.personneMatrice(moi.numero);
    // ceux qui sont dans la Matrice voient tout de suite le nouveau bonhomme
    for (const ws of this.ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.numero === p.numero) { Object.assign(a, { tenue: p.tenue, couleur: p.couleur, bas: p.bas, pieds: p.pieds, tete_v: p.tete_v, reglage: p.reglage }); ws.serializeAttachment(a); if (a.lieu) this.diffuser(a.lieu, { t: "avatar", p: this.publicMatrice(a) }); } }
    return { ok: true, tenue: p.tenue, couleur: p.couleur, bas: p.bas, pieds: p.pieds, tete_v: p.tete_v, reglage: p.reglage };
  }
  monAvatar(token) { const moi = this.moi(token); const p = this.personneMatrice(moi.numero); return { tenue: p.tenue, couleur: p.couleur, bas: p.bas, pieds: p.pieds, tete_v: p.tete_v, reglage: p.reglage, fait: p.fait }; }
  teteAvatar(token, num) {
    this.moi(token);
    const m = this.sql.exec("SELECT av_tete FROM membres WHERE numero = ?", Number(num)).toArray()[0];
    return m && m.av_tete;
  }
  personneMatrice(num) {
    const m = this.sql.exec("SELECT numero, prenom, nom, admin, av_tenue, av_couleur, av_tete IS NOT NULL AS a_tete, av_v, av_reglage, av_bas, av_pieds FROM membres WHERE numero = ?", Number(num)).toArray()[0];
    return { numero: m.numero, nom: m.prenom, initiales: ((m.prenom[0] || "") + (m.nom[0] || "")).toUpperCase(), admin: !!m.admin,
      tenue: m.av_tenue || "civil", couleur: m.av_couleur || "#22324f", bas: m.av_bas || null, pieds: m.av_pieds || null, tete_v: m.a_tete ? (m.av_v || 1) : 0, fait: (m.av_v || 0) > 0, reglage: (() => { try { return JSON.parse(m.av_reglage) || null; } catch (e) { return null; } })() };
  }
  publicMatrice(a) { return { numero: a.numero, nom: a.nom, initiales: a.initiales, admin: a.admin, tenue: a.tenue, couleur: a.couleur, bas: a.bas, pieds: a.pieds, tete_v: a.tete_v, reglage: a.reglage, danse: a.danse === "disco" ? "disco" : a.danse ? "balance" : false, x: a.x, z: a.z }; }

  /* ----- La Matrice : présence en direct (WebSocket, mise en veille possible) ----- */
  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") !== "websocket") return new Response("WebSocket attendu", { status: 426 });
    let moi;
    try { moi = this.moi(url.searchParams.get("t") || ""); } catch (e) { return new Response(e.message, { status: e.status || 401 }); }
    const s = this.sql.exec("SELECT exclu_jusqua FROM matrice_sanctions WHERE numero = ?", Number(moi.numero)).toArray()[0];
    if (s && s.exclu_jusqua && new Date(s.exclu_jusqua) > new Date()) return new Response("Exclu de la Matrice jusqu'au " + new Date(s.exclu_jusqua).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }), { status: 403 });
    const p = this.personneMatrice(moi.numero);
    // un seul appareil à la fois dans la Matrice : l'ancien est fermé
    for (const ws of this.ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.numero === p.numero) { try { ws.close(4000, "Ouvert sur un autre appareil"); } catch (e) {} } }
    const [client, serveur] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(serveur);
    serveur.serializeAttachment({ ...p, lieu: null, x: 0, z: 0 });
    return new Response(null, { status: 101, webSocket: client });
  }
  presents(lieu, sauf) {
    return this.ctx.getWebSockets().map(ws => [ws, ws.deserializeAttachment()]).filter(([ws, a]) => a && a.lieu === lieu && ws !== sauf);
  }
  diffuser(lieu, msg, sauf) { const t = JSON.stringify(msg); for (const [ws] of this.presents(lieu, sauf)) { try { ws.send(t); } catch (e) {} } }
  comptes() { const c = {}; for (const ws of this.ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.lieu) c[a.lieu] = (c[a.lieu] || 0) + 1; } return c; }
  diffuserComptes() { const t = JSON.stringify({ t: "comptes", lieux: this.comptes() }); for (const ws of this.ctx.getWebSockets()) { try { ws.send(t); } catch (e) {} } }
  async webSocketMessage(ws, brut) {
    let m; try { m = JSON.parse(brut); } catch (e) { return; }
    const a = ws.deserializeAttachment(); if (!a) return;
    const nb = v => Math.max(-60, Math.min(60, Number(v) || 0));
    if (m.t === "entrer" && LIEUX_MATRICE.includes(m.lieu)) {
      const ancien = a.lieu;
      Object.assign(a, { lieu: m.lieu, x: nb(m.x), z: nb(m.z), danse: false }); ws.serializeAttachment(a);
      if (ancien && ancien !== m.lieu) this.diffuser(ancien, { t: "part", numero: a.numero });
      // les messages ne restent qu'une heure
      this.sql.exec("DELETE FROM matrice_dits WHERE cree < ?", new Date(Date.now() - DITS_DUREE).toISOString());
      const dits = this.sql.exec("SELECT id, numero, nom, texte, cree FROM matrice_dits WHERE lieu = ? ORDER BY id DESC LIMIT 20", m.lieu).toArray().reverse();
      ws.send(JSON.stringify({ t: "etat", lieu: m.lieu, moi: a.numero, gens: this.presents(m.lieu, ws).map(([, b]) => this.publicMatrice(b)), dits }));
      this.diffuser(m.lieu, { t: "arrive", p: this.publicMatrice(a) }, ws);
      ws.send(JSON.stringify({ t: "dj", dj: await this.etatDJ() }));   // la nuit, on entend la fête depuis la cour
      if (m.lieu === "fetes") { const n = await this.ctx.storage.get("lumiere_fetes"); ws.send(JSON.stringify({ t: "lumiere", niveau: typeof n === "number" ? n : 1 })); }
      ws.send(JSON.stringify({ t: "ambiance", mode: (await this.ctx.storage.get("ambiance")) || "auto" }));
      this.diffuserComptes();
    } else if (m.t && m.t.startsWith("dj_") && a.lieu === "fetes") {
      const dj = await this.etatDJ();
      if (m.t === "dj_etat") { ws.send(JSON.stringify({ t: "dj", dj })); return; }
      if (m.t === "dj_jouer" || m.t === "dj_file") {
        const f = this.ficheDJ(m.id, a.nom); if (!f) return;
        if (m.t === "dj_jouer" || !dj.courant) dj.courant = { ...f, debut: Date.now() + 1500 };
        else if (dj.file.length < 30) dj.file.push(f);
      } else if (m.t === "dj_fini") {
        if (!dj.courant || dj.courant.id !== Number(m.id) || Date.now() - dj.courant.debut < 5000) return;   // un seul passe au suivant
        await this.suivantDJ(dj);
      } else if (m.t === "dj_passer") { await this.suivantDJ(dj); }
      else if (m.t === "dj_stop") { dj.courant = null; }
      else if (m.t === "dj_retirer") { dj.file.splice(Number(m.i), 1); }
      else return;
      await this.majDJ(dj);
    } else if (m.t === "ambiance" && a.admin && ["auto", "jour", "nuit"].includes(m.mode)) {
      await this.ctx.storage.put("ambiance", m.mode);
      const t = JSON.stringify({ t: "ambiance", mode: m.mode }); for (const w of this.ctx.getWebSockets()) { try { w.send(t); } catch (e) {} }
    } else if (m.t === "lumiere" && a.admin) {
      // seul l'administrateur règle la luminosité de la salle des fêtes (de 15 % à 100 %), pour tout le monde
      const niveau = Math.max(.15, Math.min(1, Number(m.niveau) || 1));
      await this.ctx.storage.put("lumiere_fetes", niveau); this.diffuser("fetes", { t: "lumiere", niveau });
    } else if (m.t === "danse" && a.lieu) {
      a.danse = m.on === "disco" ? "disco" : m.on ? "balance" : false; ws.serializeAttachment(a);
      this.diffuser(a.lieu, { t: "danse", numero: a.numero, on: a.danse }, ws);
    } else if (m.t === "aller" && a.lieu) {
      Object.assign(a, { x: nb(m.x), z: nb(m.z) }); ws.serializeAttachment(a);
      this.diffuser(a.lieu, { t: "aller", numero: a.numero, x: a.x, z: a.z }, ws);
    } else if (m.t === "dire" && a.lieu) {
      const texte = texte_(m.texte, 140); if (!texte) return;
      const s = this.sql.exec("SELECT muet_jusqua FROM matrice_sanctions WHERE numero = ?", a.numero).toArray()[0];
      if (s && s.muet_jusqua && new Date(s.muet_jusqua) > new Date()) { ws.send(JSON.stringify({ t: "info", texte: "L'administrateur t'a demandé de te taire un moment." })); return; }
      const cree = new Date().toISOString();
      const id = this.sql.exec("INSERT INTO matrice_dits (lieu, numero, nom, texte, cree) VALUES (?, ?, ?, ?, ?) RETURNING id", a.lieu, a.numero, a.nom, texte, cree).one().id;
      this.sql.exec("DELETE FROM matrice_dits WHERE (lieu = ? AND id NOT IN (SELECT id FROM matrice_dits WHERE lieu = ? ORDER BY id DESC LIMIT 20)) OR cree < ?", a.lieu, a.lieu, new Date(Date.now() - DITS_DUREE).toISOString());
      this.diffuser(a.lieu, { t: "dit", id, numero: a.numero, nom: a.nom, texte, cree });
    } else if (m.t === "effacer" && a.lieu) {
      // chacun retire ses propres messages ; l'administrateur peut tout retirer
      if (m.tout && a.admin) { this.sql.exec("DELETE FROM matrice_dits WHERE lieu = ?", a.lieu); this.diffuser(a.lieu, { t: "efface", tout: true }); return; }
      const d = this.sql.exec("SELECT numero FROM matrice_dits WHERE id = ? AND lieu = ?", Number(m.id), a.lieu).toArray()[0];
      if (!d || (d.numero !== a.numero && !a.admin)) return;
      this.sql.exec("DELETE FROM matrice_dits WHERE id = ?", Number(m.id)); this.diffuser(a.lieu, { t: "efface", id: Number(m.id) });
    } else if ((m.t === "taire" || m.t === "exclure") && a.admin) {
      const cible = Number(m.numero); if (!cible || cible === a.numero) return;
      const jusqua = new Date(Date.now() + (m.t === "taire" ? 3600e3 : 24 * 3600e3)).toISOString();
      this.sql.exec(`INSERT INTO matrice_sanctions (numero, ${m.t === "taire" ? "muet_jusqua" : "exclu_jusqua"}) VALUES (?, ?)
        ON CONFLICT(numero) DO UPDATE SET ${m.t === "taire" ? "muet_jusqua" : "exclu_jusqua"} = excluded.${m.t === "taire" ? "muet_jusqua" : "exclu_jusqua"}`, cible, jusqua);
      for (const w of this.ctx.getWebSockets()) { const b = w.deserializeAttachment(); if (b && b.numero === cible) {
        if (m.t === "taire") w.send(JSON.stringify({ t: "info", texte: "L'administrateur t'a demandé de te taire pendant une heure." }));
        else { try { w.close(4003, "Exclu de la Matrice pour 24 heures par l'administrateur"); } catch (e) {} } } }
      ws.send(JSON.stringify({ t: "info", texte: m.t === "taire" ? "C'est fait : il ne peut plus parler pendant une heure." : "C'est fait : il est exclu de la Matrice pour 24 heures." }));
    }
  }
  async webSocketClose(ws) { this.quitter(ws); }
  async webSocketError(ws) { this.quitter(ws); }
  quitter(ws) {
    const a = ws.deserializeAttachment(); if (!a || !a.lieu) return;
    const lieu = a.lieu; a.lieu = null; try { ws.serializeAttachment(a); } catch (e) {}
    this.diffuser(lieu, { t: "part", numero: a.numero }, ws); this.diffuserComptes();
  }

  async changerEscalier(token, x) {
    const moi = this.moi(token, { tous: true }), bat = batValide(x.bat), etage = bat ? etageValide(x.etage) : null;
    if (bat && x.etage !== null && x.etage !== undefined && x.etage !== "" && etageValide(x.etage) === null) throw new Refus("L'étage va du rez-de-chaussée au 7e");
    if (x.bat && !bat) throw new Refus("Cet escalier n'existe pas à la caserne (il n'y avait pas de Q, T, U, V ni W)");
    this.sql.exec("UPDATE membres SET bat = ?, etage = ? WHERE email = ?", bat, etage, moi.email);
    return { ok: true, bat, etage };
  }
  async changerPhoto(token, photo) {
    const moi = this.moi(token, { tous: true }), ok = photoValide(photo);
    if (!ok) throw new Refus("Photo invalide ou trop lourde");
    this.sql.exec("UPDATE membres SET photo = ? WHERE email = ?", ok, moi.email);
    return { ok: true };
  }

  // tous: true → aussi les comptes en attente ou refusés (pour leur statut, leur photo)
  moi(token, { tous = false } = {}) {
    const m = token && this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, admin, cree, photo IS NOT NULL AS a_photo, statut, motif, bat, etage FROM membres WHERE token = ?", token).toArray()[0];
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
  // le fichier d'un jeu est envoyé morceau par morceau (un gros jeu dépasserait la taille d'un message)
  async infoJeu(token, id) {
    await this.verifierAcces(token);
    const j = this.sql.exec("SELECT taille, morceaux, nom_fichier FROM jeux WHERE id = ? AND complet = 1", Number(id)).toArray()[0];
    return j ? { taille: j.taille, morceaux: j.morceaux, nom: j.nom_fichier } : null;
  }
  async morceauFichier(token, id, n) {
    await this.verifierAcces(token);
    const m = this.sql.exec("SELECT data FROM jeux_morceaux WHERE jeu = ? AND n = ?", Number(id), Number(n)).toArray()[0];
    if (!m) throw new Refus("Morceau manquant", 404);
    return m.data;
  }
  async jaquetteJeu(token, id, x) {
    await this.exigerAdmin(token);
    this.sql.exec("UPDATE jeux SET jaquette = ? WHERE id = ?", jaquette(x.jaquette), Number(id));
    return { ok: true };
  }
  /* ----- La discothèque du DJ : tous les anciens validés peuvent déposer ----- */
  musiques(token) {
    this.moi(token);
    return this.sql.exec("SELECT id, titre, artiste, auteur, auteur_nom, taille, duree, cree FROM musiques WHERE complet = 1 ORDER BY id DESC").toArray();
  }
  nouvelleMusique(token, x) {
    const moi = this.moi(token);
    const titre = texte(x.titre, 90), artiste = texte(x.artiste, 60), taille = Number(x.taille), type = String(x.type || "");
    if (!titre) throw new Refus("Donne un titre à la musique");
    if (!/^audio\/(mpeg|mp3|mp4|x-m4a|aac|ogg|wav|x-wav|webm)$/.test(type)) throw new Refus("Seuls les fichiers audio sont acceptés (MP3, M4A, OGG…)");
    if (!(taille > 0 && taille <= MUSIQUE_MAX)) throw new Refus("Fichier trop lourd (50 Mo maximum par musique)");
    const total = this.sql.exec("SELECT COALESCE(SUM(taille), 0) AS t FROM musiques").one().t;
    if (total + taille > DISCO_MAX) throw new Refus("La discothèque est pleine : demande à l'administrateur de faire de la place");
    const morceaux = Math.ceil(taille / MORCEAU);
    this.sql.exec("INSERT INTO musiques (titre, artiste, auteur, auteur_nom, type, taille, morceaux, duree, cree) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      titre, artiste, Number(moi.numero), `${moi.prenom} ${moi.nom}`, type, taille, morceaux, Number(x.duree) > 0 ? Math.min(3600, Number(x.duree)) : null, new Date().toISOString());
    return { id: this.sql.exec("SELECT last_insert_rowid() AS id").one().id, morceaux, taille_morceau: MORCEAU };
  }
  morceauMusique(token, id, n, data) {
    const moi = this.moi(token);
    const m = this.sql.exec("SELECT * FROM musiques WHERE id = ?", Number(id)).toArray()[0];
    if (!m) throw new Refus("Musique introuvable", 404);
    if (m.auteur !== Number(moi.numero)) throw new Refus("Ce n'est pas ta musique", 403);
    n = Number(n);
    if (!(n >= 0 && n < m.morceaux) || data.byteLength > MORCEAU) throw new Refus("Morceau invalide");
    this.sql.exec("INSERT OR REPLACE INTO musiques_morceaux (m, n, data) VALUES (?, ?, ?)", m.id, n, data);
    const recus = this.sql.exec("SELECT COUNT(*) AS c FROM musiques_morceaux WHERE m = ?", m.id).one().c;
    if (recus === m.morceaux) this.sql.exec("UPDATE musiques SET complet = 1 WHERE id = ?", m.id);
    return { ok: true, complet: recus === m.morceaux };
  }
  infoMusique(token, id) {
    this.moi(token);
    const m = this.sql.exec("SELECT taille, morceaux, type FROM musiques WHERE id = ? AND complet = 1", Number(id)).toArray()[0];
    return m || null;
  }
  morceauDeMusique(token, id, n) {
    this.moi(token);
    const m = this.sql.exec("SELECT data FROM musiques_morceaux WHERE m = ? AND n = ?", Number(id), Number(n)).toArray()[0];
    if (!m) throw new Refus("Morceau manquant", 404);
    return m.data;
  }
  async retirerMusique(token, id) {
    const moi = this.moi(token), admin = await this.estAdmin(token);
    const m = this.sql.exec("SELECT auteur FROM musiques WHERE id = ?", Number(id)).toArray()[0];
    if (!m) throw new Refus("Musique introuvable", 404);
    if (!admin && m.auteur !== Number(moi.numero)) throw new Refus("Seul celui qui l'a déposée (ou l'administrateur) peut la retirer", 403);
    this.sql.exec("DELETE FROM musiques_morceaux WHERE m = ?", Number(id));
    this.sql.exec("DELETE FROM musiques WHERE id = ?", Number(id));
    const dj = await this.etatDJ();
    if (dj.courant && dj.courant.id === Number(id)) dj.courant = null;
    dj.file = dj.file.filter(f => f.id !== Number(id));
    await this.majDJ(dj);
    return { ok: true };
  }
  // ce qui passe chez le DJ (pour toute la salle des fêtes), et la file d'attente
  async etatDJ() { return (await this.ctx.storage.get("dj")) || { courant: null, file: [] }; }
  async majDJ(dj) { await this.ctx.storage.put("dj", dj); for (const l of LIEUX_MATRICE) this.diffuser(l, { t: "dj", dj }); }
  ficheDJ(id, qui) {
    const m = this.sql.exec("SELECT id, titre, artiste, duree FROM musiques WHERE id = ? AND complet = 1", Number(id)).toArray()[0];
    return m ? { id: m.id, titre: m.titre, artiste: m.artiste, duree: m.duree, par: qui } : null;
  }
  async suivantDJ(dj) { const f = dj.file.shift(); dj.courant = f ? { ...f, debut: Date.now() + 1500 } : null; }

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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    const registre = env.COMPTEUR.get(env.COMPTEUR.idFromName("caserne"));
    const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const corps = async () => { try { return await request.json(); } catch { return {}; } };
    const route = `${request.method} ${url.pathname}`;

    // la Matrice : connexion en direct (WebSocket) vers le registre
    if (url.pathname === "/api/matrice" && request.headers.get("Upgrade") === "websocket") return registre.fetch(request);
    // tête du chef de poste (réglée par l'administrateur)
    if (request.method === "GET" && url.pathname === "/api/pnj/tete") {
      let data; try { data = await registre.tetePNJ(url.searchParams.get("t") || ""); } catch (e) { return new Response("Connexion requise", { status: 401 }); }
      if (!data) return new Response("Pas de tête", { status: 404 });
      return new Response(Uint8Array.from(atob(data.split(",")[1]), c => c.charCodeAt(0)), { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=604800" } });
    }
    // tête détourée du bonhomme d'un membre (image PNG)
    if (request.method === "GET" && /^\/api\/avatar\/\d+\/tete$/.test(url.pathname)) {
      let data;
      try { data = await registre.teteAvatar(url.searchParams.get("t") || "", url.pathname.split("/")[3]); }
      catch (e) { return new Response("Connexion requise", { status: 401 }); }
      if (!data) return new Response("Pas de tête", { status: 404 });
      const bin = Uint8Array.from(atob(data.split(",")[1]), c => c.charCodeAt(0));
      return new Response(bin, { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=604800" } });
    }

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

    // fichier d'un jeu de la borne (réservé aux anciens validés).
    // EmulatorJS demande d'abord la taille (HEAD), puis le fichier (GET), envoyé en flux morceau par morceau.
    // Adresse : /api/jeux/<id>/rom/<id>-<nom du fichier> (l'ancienne /api/jeux/<id>/fichier marche toujours)
    const mJeu = url.pathname.match(/^\/api\/jeux\/(\d+)\/(?:fichier|rom\/[^/]+)$/);
    if ((request.method === "GET" || request.method === "HEAD") && mJeu) {
      const t = url.searchParams.get("t") || "", id = mJeu[1];
      let info;
      try { info = await registre.infoJeu(t, id); } catch (e) { return new Response("Connexion requise", { status: 401 }); }
      if (!info) return new Response("Introuvable", { status: 404 });
      const entetes = { "Content-Type": "application/octet-stream", "Content-Length": String(info.taille), "Cache-Control": "private, max-age=86400",
        "Content-Disposition": `inline; filename="${info.nom}"` };
      if (request.method === "HEAD") return new Response(null, { headers: entetes });
      const { readable, writable } = new FixedLengthStream(info.taille);
      ctx.waitUntil((async () => {
        const w = writable.getWriter();
        try {
          for (let n = 0; n < info.morceaux; n++) await w.write(new Uint8Array(await registre.morceauFichier(t, id, n)));
          await w.close();
        } catch (e) { await w.abort(e).catch(() => {}); }
      })());
      return new Response(readable, { headers: entetes });
    }
    // fichier d'une musique de la discothèque (lecture avec « Range » pour se caler au bon moment)
    const mMus = url.pathname.match(/^\/api\/musiques\/(\d+)\/fichier$/);
    if ((request.method === "GET" || request.method === "HEAD") && mMus) {
      const t = url.searchParams.get("t") || "", id = mMus[1];
      let info;
      try { info = await registre.infoMusique(t, id); } catch (e) { return new Response("Connexion requise", { status: 401 }); }
      if (!info) return new Response("Introuvable", { status: 404 });
      let debut = 0, fin = info.taille - 1, partiel = false;
      const rg = (request.headers.get("Range") || "").match(/^bytes=(\d*)-(\d*)$/);
      if (rg && (rg[1] || rg[2])) {
        partiel = true;
        if (rg[1]) { debut = Number(rg[1]); if (rg[2]) fin = Math.min(fin, Number(rg[2])); } else { debut = Math.max(0, info.taille - Number(rg[2])); }
        if (debut > fin) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.taille}` } });
      }
      const L = fin - debut + 1;
      const entetes = { "Content-Type": info.type, "Accept-Ranges": "bytes", "Content-Length": String(L), "Cache-Control": "private, max-age=86400" };
      if (partiel) entetes["Content-Range"] = `bytes ${debut}-${fin}/${info.taille}`;
      if (request.method === "HEAD") return new Response(null, { status: partiel ? 206 : 200, headers: entetes });
      const { readable, writable } = new FixedLengthStream(L);
      ctx.waitUntil((async () => {
        const w = writable.getWriter();
        try {
          for (let n = Math.floor(debut / MORCEAU); n * MORCEAU <= fin; n++) {
            const b = new Uint8Array(await registre.morceauDeMusique(t, id, n)), d0 = n * MORCEAU;
            await w.write(b.subarray(Math.max(0, debut - d0), Math.min(b.byteLength, fin - d0 + 1)));
          }
          await w.close();
        } catch (e) { await w.abort(e).catch(() => {}); }
      })());
      return new Response(readable, { status: partiel ? 206 : 200, headers: entetes });
    }
    if (request.method === "PUT" && /^\/api\/musiques\/\d+\/morceau\/\d+$/.test(url.pathname)) {
      const [, , , id, , n] = url.pathname.split("/");
      try { return Response.json(await registre.morceauMusique(token, id, n, await request.arrayBuffer())); }
      catch (e) { return Response.json({ erreur: e.message }, { status: e.status || 400 }); }
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
      else if (route === "GET /api/musiques") r = await registre.musiques(token);
      else if (route === "POST /api/musiques") r = await registre.nouvelleMusique(token, await corps());
      else if (request.method === "DELETE" && /^\/api\/musiques\/\d+$/.test(url.pathname)) r = await registre.retirerMusique(token, url.pathname.split("/")[3]);
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
      else if (route === "GET /api/pnj") r = await registre.infoPNJ(token);
      else if (route === "PUT /api/pnj") r = await registre.changerPNJ(token, await corps());
      else if (route === "PUT /api/moi/avatar") r = await registre.changerAvatar(token, await corps());
      else if (route === "GET /api/moi/avatar") r = await registre.monAvatar(token);
      else if (route === "PUT /api/moi/escalier") r = await registre.changerEscalier(token, await corps());
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
