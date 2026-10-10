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
const photoValide = v => typeof v === "string" && v.startsWith("data:image/jpeg;base64,") && v.length <= PHOTO_MAX ? v : null;

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
    // colonnes ajoutées avec la connexion (code provisoire puis mot de passe personnel)
    for (const col of ["code_hash TEXT", "mdp_hash TEXT", "setup TEXT", "essais INTEGER DEFAULT 0", "bloque_jusqua TEXT", "admin INTEGER DEFAULT 0", "photo TEXT"]) {
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
    this.sql.exec(`INSERT INTO membres (numero, nom, prenom, qualite, parent, email, token, cree, code_hash, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      admin: !!m.admin, cree: m.cree, a_photo: m.a_photo !== undefined ? !!m.a_photo : !!m.photo };
  }

  async membres() {
    const fr = new Intl.Collator("fr", { sensitivity: "base" });
    return this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, cree, admin, photo IS NOT NULL AS a_photo FROM membres")
      .toArray().map(m => ({ ...m, numero: numero(m.numero), admin: !!m.admin, a_photo: !!m.a_photo }))
      .sort((a, b) => fr.compare(a.nom, b.nom) || fr.compare(a.prenom, b.prenom));
  }

  async photo(num) {
    const m = this.sql.exec("SELECT photo FROM membres WHERE numero = ?", Number(num)).toArray()[0];
    return m && m.photo || null;
  }

  async changerPhoto(token, photo) {
    const moi = this.moi(token), ok = photoValide(photo);
    if (!ok) throw new Refus("Photo invalide ou trop lourde");
    this.sql.exec("UPDATE membres SET photo = ? WHERE email = ?", ok, moi.email);
    return { ok: true };
  }

  moi(token) {
    const m = token && this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, admin, cree, photo IS NOT NULL AS a_photo FROM membres WHERE token = ?", token).toArray()[0];
    if (!m) {
      if (String(token).startsWith("adm-")) throw new Refus("Fais d'abord ton laissez-passer au poste de police", 403);
      throw new Refus("Laissez-passer inconnu", 401);
    }
    return this.public(m);
  }

  async boite(token) {
    const moi = this.moi(token);
    const liste = col => this.sql.exec(`SELECT id, de, a, sujet, texte, envoye, lu FROM messages WHERE ${col} = ? ORDER BY id DESC LIMIT 200`, moi.email).toArray();
    return { moi, recus: liste("a"), envoyes: liste("de") };
  }

  async envoyer(token, lettre) {
    const moi = this.moi(token);
    const a = texte(lettre.a, 120).toLowerCase();
    if (!this.sql.exec("SELECT 1 FROM membres WHERE email = ?", a).toArray().length) throw new Refus("Destinataire inconnu");
    const sujet = texte(lettre.sujet, 120) || "(sans objet)", corps = texte(lettre.texte, 5000);
    if (!corps) throw new Refus("Le message est vide");
    this.sql.exec("INSERT INTO messages (de, a, sujet, texte, envoye) VALUES (?, ?, ?, ?, ?)", moi.email, a, sujet, corps, new Date().toISOString());
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
      const data = await registre.photo(url.pathname.split("/")[3]);
      if (!data) return new Response("Pas de photo", { status: 404 });
      const bin = Uint8Array.from(atob(data.split(",")[1]), c => c.charCodeAt(0));
      return new Response(bin, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=300" } });
    }

    try {
      let r;
      if (route === "POST /api/inscription") r = await registre.inscrire(await corps(), token);
      else if (route === "POST /api/connexion") r = await registre.connexion(await corps());
      else if (route === "POST /api/mot-de-passe") r = await registre.motDePasse(await corps());
      else if (route === "GET /api/membres") r = await registre.membres();
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
        : /Trop d'essais/.test(m) ? 429 : /réservé|Réservé|Fais d'abord/.test(m) ? 403 : /introuvable/.test(m) ? 404
        : /pas encore configurée/.test(m) ? 503 : 400);
      return Response.json({ erreur: e.message || "Erreur" }, { status });
    }
  },
};
