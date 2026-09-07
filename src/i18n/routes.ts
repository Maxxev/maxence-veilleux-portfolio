// La correspondance des URL entre les langues.
//
// Le français vit à la racine (`/projets`), l'anglais est préfixé
// (`/en/projects`). Les segments sont traduits, pas seulement préfixés : une
// URL anglaise qui dit « projets » sent la traduction bâclée, et c'est la
// première chose que voit un employeur anglophone.
//
// Ajouter une page = une entrée ici + un fichier dans src/pages/ et un dans
// src/pages/en/. Le sélecteur de langue et le pied de page suivent tout seuls.

export const LANGUES = ['fr', 'en'] as const;
export type Langue = (typeof LANGUES)[number];
export const LANGUE_DEFAUT: Langue = 'fr';

export const ROUTES = {
  accueil: { fr: '/', en: '/en/' },
  projets: { fr: '/projets/', en: '/en/projects/' },
  parcours: { fr: '/parcours/', en: '/en/background/' },
} as const satisfies Record<string, Record<Langue, string>>;

export type CleRoute = keyof typeof ROUTES;

/** L'URL d'une page dans une langue donnée. */
export function chemin(cle: CleRoute, langue: Langue): string {
  return ROUTES[cle][langue];
}

/** L'URL de la page de détail d'un projet. */
export function cheminProjet(slug: string, langue: Langue): string {
  return `${ROUTES.projets[langue]}${slug}/`;
}

/**
 * L'équivalent de l'URL courante dans l'autre langue.
 *
 * Le sélecteur de langue doit garder le lecteur sur la même page : le renvoyer
 * à l'accueil à chaque bascule est le défaut d'i18n le plus courant. On
 * reconnaît donc la page à partir de son chemin plutôt que de le supposer.
 */
export function cheminTraduit(
  cheminActuel: string,
  vers: Langue,
  slugProjet?: string,
): string {
  const normalise = cheminActuel.endsWith('/') ? cheminActuel : `${cheminActuel}/`;
  const depuis: Langue = normalise === '/en/' || normalise.startsWith('/en/') ? 'en' : 'fr';

  if (depuis === vers) return normalise;

  if (slugProjet) return cheminProjet(slugProjet, vers);

  for (const cle of Object.keys(ROUTES) as CleRoute[]) {
    if (ROUTES[cle][depuis] === normalise) return ROUTES[cle][vers];
  }

  // Page inconnue (404, par exemple) : l'accueil est le seul repli honnête.
  return ROUTES.accueil[vers];
}

/** La langue déduite d'une URL. */
export function langueDepuisUrl(url: URL): Langue {
  return url.pathname.startsWith('/en') ? 'en' : 'fr';
}
