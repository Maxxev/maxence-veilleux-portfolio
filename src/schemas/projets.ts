// Un projet du portfolio.
//
// Un projet = un fichier Markdown par langue :
//   src/content/projets/fr/<slug>.md
//   src/content/projets/en/<slug>.md
// Le slug doit être identique dans les deux langues : c'est lui qui relie les
// deux versions et qui permet au sélecteur de langue de rester sur la même
// page. `npm run verifier:traductions` échoue si une traduction manque.
import { z } from 'astro/zod';

// Ce qu'un employeur cherche à situer en un coup d'œil.
export const CATEGORIES = ['pro', 'etudes', 'perso'] as const;

export const projetSchema = z.strictObject({
  titre: z.string(),
  // Une phrase, affichée sur la carte. Vise 100 à 160 caractères : plus court
  // ne dit rien, plus long déborde de la carte sur mobile.
  resume: z.string(),

  categorie: z.enum(CATEGORIES),

  // Année ou intervalle affiché tel quel (« 2025 », « 2024-2025 »)
  annee: z.string(),

  // Ce que TU as fait, à distinguer de ce que le projet est. C'est la ligne
  // que lit un employeur pour évaluer ta contribution réelle dans un travail
  // d'équipe.
  role: z.string(),

  // Ordre d'affichage : petit nombre = plus haut. Jamais l'ordre des fichiers.
  ordre: z.number(),
  // Remonte le projet sur la page d'accueil (les trois premiers par `ordre`).
  vedette: z.boolean().default(false),

  // Les technologies, dans l'ordre d'importance pour ce projet précis.
  technos: z.array(z.string()).min(1),

  // Trois à cinq faits saillants, en puces. C'est ce qui remplit la colonne
  // gauche de la page de détail.
  faits: z.array(z.string()).default([]),

  // --- Médias --------------------------------------------------------------
  // `couverture` s'affiche sur la carte ET en tête de la page de détail.
  couverture: z
    .strictObject({
      src: z.string(),
      alt: z.string(),
      // Cadrage quand l'image est rognée (valeur CSS `object-position`)
      position: z.string().default('50% 50%'),
    })
    .nullable()
    .default(null),

  // Vidéos locales (démo, gameplay). Jamais en lecture automatique : image
  // d'affiche + `preload="none"`, la vidéo ne se télécharge qu'au clic.
  videos: z
    .array(
      z.strictObject({
        src: z.string(),
        poster: z.string(),
        titre: z.string(),
      }),
    )
    .default([]),

  // Identifiant YouTube seulement (pas l'URL complète) : le composant construit
  // une façade cliquable, aucun iframe ni cookie tiers au chargement.
  youtube: z
    .array(
      z.strictObject({
        id: z.string(),
        titre: z.string(),
      }),
    )
    .default([]),

  // --- Liens sortants ------------------------------------------------------
  // `type` choisit l'icône et le libellé par défaut. Un projet sous entente de
  // confidentialité n'a tout simplement aucun lien : c'est le cas normal, pas
  // une donnée manquante.
  liens: z
    .array(
      z.strictObject({
        type: z.enum(['site', 'depot', 'jeu', 'video', 'document']),
        url: z.string(),
        // Remplace le libellé par défaut du type quand il ne convient pas
        libelle: z.string().optional(),
      }),
    )
    .default([]),

  // Bandeau affiché en tête de la page de détail. Sert à dire « ce projet est
  // sous entente de confidentialité » ou « déploiement à venir » sans que ça
  // ressemble à un trou dans le portfolio.
  mention: z.string().nullable().default(null),
});

export type Projet = z.infer<typeof projetSchema>;
