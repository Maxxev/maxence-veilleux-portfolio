// Les technologies, regroupées par usage.
//
// Règle que je m'impose ici : rien n'entre dans cette liste qui n'ait servi
// dans un projet réellement livré. Un employeur croise cette liste avec son
// offre d'emploi, et un nom gonflé se paie en entrevue.
//
// Pour ajouter une techno : une chaîne dans le bon groupe. Pour ajouter un
// groupe : une entrée ici et sa traduction dans les deux dictionnaires.
import type { Langue } from '../i18n/routes.ts';

export type GroupeStack = {
  cle: string;
  libelle: Record<Langue, string>;
  items: string[];
};

export const STACK: GroupeStack[] = [
  {
    cle: 'web',
    libelle: { fr: 'Web', en: 'Web' },
    items: ['Astro', 'Laravel', 'PHP', 'JavaScript', 'TypeScript', 'HTML', 'SCSS', 'WordPress'],
  },
  {
    cle: 'mobile',
    libelle: { fr: 'Mobile', en: 'Mobile' },
    // TODO Maxence : Ludix était en Java ou en Kotlin? Retire celui qui ne
    // s'applique pas — les deux affichés donnent l'impression d'un remplissage.
    items: ['Android Studio', 'Java', 'Kotlin'],
  },
  {
    cle: 'donnees',
    libelle: { fr: 'Données et API', en: 'Data and APIs' },
    items: ['API REST', 'MySQL', 'SQLite', 'Python', 'Flask'],
  },
  {
    cle: 'jeu',
    libelle: { fr: 'Jeu vidéo', en: 'Game development' },
    items: ['Unity', 'C#'],
  },
  {
    cle: 'design',
    libelle: { fr: 'Design et outils', en: 'Design and tooling' },
    items: ['Figma', 'Git', 'Photoshop', 'Illustrator', 'Blender'],
  },
];
