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
    const token = crypto.randomUUID();
    this.sql.exec("INSERT INTO membres VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      n, nom, prenom, qualite, parent, email, token, new Date().toISOString());
    return { numero: numero(n), email, token, nom, prenom, qualite, parent };
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
      else if (route === "GET /api/membres") r = await registre.membres();
      else if (route === "GET /api/boite") r = await registre.boite(token);
      else if (route === "POST /api/messages") r = await registre.envoyer(token, await corps());
      else if (request.method === "POST" && /^\/api\/messages\/\d+\/lu$/.test(url.pathname)) r = await registre.marquerLu(token, url.pathname.split("/")[3]);
      else return Response.json({ erreur: "Introuvable" }, { status: 404 });
      return Response.json(r);
    } catch (e) {
      // les erreurs traversent le Durable Object sans leur classe : on retrouve le statut par le message
      const status = e.status || (/Laissez-passer inconnu/.test(e.message) ? 401 : 400);
      return Response.json({ erreur: e.message || "Erreur" }, { status });
    }
  },
};
