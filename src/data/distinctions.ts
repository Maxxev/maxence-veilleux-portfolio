// Bourses et distinctions.
//
// Toutes datent du secondaire, et c'est assumé : elles sont reléguées en bas
// de /parcours et présentées comme une note de constance, pas comme un
// argument professionnel. Les iframes Facebook de l'ancien portfolio ont été
// remplacées par de simples liens — elles ne se chargeaient pas sur mobile,
// posaient trois cookies tiers et ajoutaient une seconde au chargement.
export type Distinction = {
  annee: string;
  titre: { fr: string; en: string };
  etablissement: string;
  url?: string;
};

export const DISTINCTIONS: Distinction[] = [
  {
    annee: '2024',
    titre: {
      fr: 'Bourse de la persévérance',
      en: 'Perseverance scholarship',
    },
    etablissement: 'École internationale du Phare',
    url: 'https://www.facebook.com/duphare/posts/1020206626775304',
  },
  {
    annee: '2024',
    titre: { fr: 'Bourse des anciens', en: 'Alumni scholarship' },
    etablissement: 'École internationale du Phare',
    url: 'https://www.facebook.com/duphare/posts/1016174943845139',
  },
  {
    annee: '2020',
    titre: {
      fr: "Trophée d'excellence, Gala des Bravos",
      en: 'Excellence trophy, Gala des Bravos',
    },
    etablissement: 'École Sainte-Anne',
    url: 'https://www.facebook.com/CSSsherbrooke/photos/a.3127925457236446/3127926830569642',
  },
  {
    annee: '2019',
    titre: {
      fr: 'Bourse du Conseil des commissaires',
      en: 'Board of Commissioners scholarship',
    },
    etablissement: 'École Sainte-Anne',
  },
  {
    annee: '2017',
    titre: {
      fr: 'Bourse du Conseil des commissaires',
      en: 'Board of Commissioners scholarship',
    },
    etablissement: 'École Eymard',
  },
];
