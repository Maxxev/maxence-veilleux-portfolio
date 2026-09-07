// Les schémas vivent dans src/schemas/ pour rester lisibles et commentés ;
// ce fichier ne fait que les brancher sur les loaders d'Astro.
import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

import { projetSchema } from './schemas/projets.ts';
import { blocSchema } from './schemas/blocs.ts';

// Un projet par langue : `fr/answerit.md` et `en/answerit.md`. L'identifiant
// que produit le loader est donc « fr/answerit », et c'est ce préfixe qui sert
// à filtrer par langue dans src/utils/projets.ts.
const projets = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projets' }),
  schema: projetSchema,
});

// Les blocs de prose : les paragraphes de /parcours et la courte bio de
// l'accueil. Ce sont des textes à liens, donc du Markdown plutôt qu'un champ
// dans un fichier de données : c'est ce qui te permet d'y glisser un
// hyperlien sans toucher au code.
const blocs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blocs' }),
  schema: blocSchema,
});

export const collections = { projets, blocs };
