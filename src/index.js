// Caserne de la Nouvelle France : sert le site (dossier public/) et tient le compteur
// des numéros de laissez-passer. Le compteur est un Durable Object : un seul exemplaire
// pour toute la caserne, donc deux inscriptions simultanées ne reçoivent jamais le même numéro.

import { DurableObject } from "cloudflare:workers";

export class Compteur extends DurableObject {
  async suivant() {
    const n = ((await this.ctx.storage.get("dernier")) || 0) + 1;
    await this.ctx.storage.put("dernier", n);
    return n;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/inscription") {
      if (request.method !== "POST") return new Response("Méthode non autorisée", { status: 405 });
      const compteur = env.COMPTEUR.get(env.COMPTEUR.idFromName("caserne"));
      const n = await compteur.suivant();
      return Response.json({ numero: String(n).padStart(4, "0") });
    }

    return env.ASSETS.fetch(request);
  },
};
