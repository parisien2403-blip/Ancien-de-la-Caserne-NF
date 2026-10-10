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
    for (const col of ["code_hash TEXT", "mdp_hash TEXT", "setup TEXT", "essais INTEGER DEFAULT 0", "bloque_jusqua TEXT"]) {
      try { this.sql.exec(`ALTER TABLE membres ADD COLUMN ${col}`); } catch (e) { /* déjà là */ }
    }
  }

  async inscrire(fiche) {
    const nom = texte(fiche.nom, 40).toUpperCase(), prenom = texte(fiche.prenom, 40);
    if (!slug(nom) || !slug(prenom)) throw new Refus("Nom et prénom obligatoires");
    const qualite = QUALITES.includes(fiche.qualite) ? fiche.qualite : QUALITES[0];
    const parent = qualite === "Gendarme" ? nom : texte(fiche.parent, 40).toUpperCase() || nom;

    const n = ((await this.ctx.storage.get("dernier")) || 0) + 1;
    await this.ctx.storage.put("dernier", n);

    let email = `${slug(prenom)}.${slug(nom)}@${DOMAINE}`;
    if (this.sql.exec("SELECT 1 FROM membres WHERE email = ?", email).toArray().length) {
      email = `${slug(prenom)}.${slug(nom)}.${numero(n)}@${DOMAINE}`;
    }
    const code = codeProvisoire();
    this.sql.exec(`INSERT INTO membres (numero, nom, prenom, qualite, parent, email, token, cree, code_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      n, nom, prenom, qualite, parent, email, crypto.randomUUID(), new Date().toISOString(), await hacher(code));
    // le code provisoire n'est donné qu'une fois, ici ; il sert à la première connexion
    return { numero: numero(n), email, code, nom, prenom, qualite, parent };
  }

  // Connexion : prénom + nom + mot de passe (ou code provisoire à la première connexion)
  async connexion({ prenom, nom, secret }) {
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
    return { numero: numero(m.numero), nom: m.nom, prenom: m.prenom, qualite: m.qualite, parent: m.parent, email: m.email };
  }

  async membres() {
    return this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email, cree FROM membres ORDER BY numero")
      .toArray().map(m => ({ ...m, numero: numero(m.numero) }));
  }

  moi(token) {
    const m = token && this.sql.exec("SELECT numero, nom, prenom, qualite, parent, email FROM membres WHERE token = ?", token).toArray()[0];
    if (!m) throw new Refus("Laissez-passer inconnu", 401);
    return { ...m, numero: numero(m.numero) };
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

    try {
      let r;
      if (route === "POST /api/inscription") r = await registre.inscrire(await corps());
      else if (route === "POST /api/connexion") r = await registre.connexion(await corps());
      else if (route === "POST /api/mot-de-passe") r = await registre.motDePasse(await corps());
      else if (route === "GET /api/membres") r = await registre.membres();
      else if (route === "GET /api/boite") r = await registre.boite(token);
      else if (route === "POST /api/messages") r = await registre.envoyer(token, await corps());
      else if (request.method === "POST" && /^\/api\/messages\/\d+\/lu$/.test(url.pathname)) r = await registre.marquerLu(token, url.pathname.split("/")[3]);
      else return Response.json({ erreur: "Introuvable" }, { status: 404 });
      return Response.json(r);
    } catch (e) {
      // les erreurs traversent le Durable Object sans leur classe : on retrouve le statut par le message
      const status = e.status || (/Laissez-passer inconnu|incorrect|Session expirée/.test(e.message) ? 401 : /Trop d'essais/.test(e.message) ? 429 : 400);
      return Response.json({ erreur: e.message || "Erreur" }, { status });
    }
  },
};
