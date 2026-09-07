// L'accès à la collection de projets.
//
// Toutes les pages passent par ici : l'accueil, la grille et les pages de
// détail. C'est ce qui garantit qu'un aperçu et sa page complète affichent les
// mêmes projets dans le même ordre : la façon la plus simple de les empêcher
// de diverger.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Langue } from '../i18n/routes.ts';

export type EntreeProjet = CollectionEntry<'projets'>;

/** « fr/answerit » → « answerit » */
export function slugDe(entree: EntreeProjet): string {
  return entree.id.split('/').slice(1).join('/');
}

/** « fr/answerit » → « fr » */
function langueDe(entree: EntreeProjet): string {
  return entree.id.split('/')[0];
}

/** Les projets d'une langue, triés par `ordre` croissant. */
export async function projets(langue: Langue): Promise<EntreeProjet[]> {
  const toutes = await getCollection('projets');
  return toutes
    .filter((entree) => langueDe(entree) === langue)
    .sort((a, b) => a.data.ordre - b.data.ordre);
}

/** Les projets marqués `vedette`, pour la page d'accueil. */
export async function projetsVedettes(
  langue: Langue,
  maximum = 3,
): Promise<EntreeProjet[]> {
  return (await projets(langue))
    .filter((entree) => entree.data.vedette)
    .slice(0, maximum);
}

/** Un projet précis, ou `undefined` s'il n'existe pas dans cette langue. */
export async function projet(
  slug: string,
  langue: Langue,
): Promise<EntreeProjet | undefined> {
  return (await projets(langue)).find((entree) => slugDe(entree) === slug);
}

/**
 * Les projets qui encadrent celui-ci, pour la navigation en bas de fiche.
 * La liste boucle : le dernier projet renvoie au premier. Un cul-de-sac en bas
 * d'une page de détail est une occasion perdue de garder le lecteur.
 */
export async function voisins(
  slug: string,
  langue: Langue,
): Promise<{ precedent: EntreeProjet; suivant: EntreeProjet } | null> {
  const liste = await projets(langue);
  if (liste.length < 2) return null;

  const index = liste.findIndex((entree) => slugDe(entree) === slug);
  if (index === -1) return null;

  return {
    precedent: liste[(index - 1 + liste.length) % liste.length],
    suivant: liste[(index + 1) % liste.length],
  };
}
