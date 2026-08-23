// Les réglages globaux du site : le contenu de `src/content/settings.json`.
//
// Tout ce qui se change sans toucher au code vit là. Le schéma est en Zod
// strict : une clé mal orthographiée casse la compilation plutôt que de
// disparaître silencieusement du site.
import { z } from 'astro/zod';

export const settingsSchema = z.strictObject({
  nom: z.string(),

  // --- Coordonnées ---------------------------------------------------------
  // `afficher: false` retire du site TOUT moyen de te joindre : le bloc de
  // contact de l'accueil, les liens du pied de page, le CTA final et les
  // données structurées JSON-LD. C'est l'interrupteur exigé par le Cégep
  // pendant l'évaluation du portfolio. Remets-le à `true` ensuite : un
  // portfolio sans moyen de contact ne convertit pas un employeur.
  contact: z.strictObject({
    afficher: z.boolean(),
    courriel: z.string(),
    linkedin: z.string(),
  }),

  // --- Profils publics -----------------------------------------------------
  // GitHub, itch.io et YouTube sont des *preuves de travail* avant d'être des
  // moyens de contact : ils montrent du code et des jeux jouables. D'où un
  // interrupteur distinct — tu peux masquer le courriel tout en gardant la
  // partie du portfolio qui démontre quelque chose.
  //
  // Un profil laissé à la chaîne vide n'est simplement pas affiché.
  profils: z.strictObject({
    afficherMalgreContactMasque: z.boolean(),
    github: z.string(),
    itch: z.string(),
    youtube: z.string(),
  }),

  // Dépose le PDF dans `public/` puis passe `afficher` à `true`.
  cv: z.strictObject({
    afficher: z.boolean(),
    url: z.string(),
  }),

  formation: z.strictObject({
    etablissement: z.string(),
    programme: z.string(),
    voie: z.string(),
    // Format AAAA-MM : l'affichage du mois est localisé au rendu.
    debut: z.string().regex(/^\d{4}-\d{2}$/),
    fin: z.string().regex(/^\d{4}-\d{2}$/),
    // La cote R parle aux universités, pas forcément aux employeurs. Elle
    // reste donc optionnelle et discrète, sur /parcours uniquement.
    coteR: z.strictObject({
      afficher: z.boolean(),
      valeur: z.string(),
    }),
  }),
});

export type Settings = z.infer<typeof settingsSchema>;
