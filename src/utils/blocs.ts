// L'accès aux blocs de prose.
import { getEntry, render } from 'astro:content';
import type { Langue } from '../i18n/routes.ts';

/**
 * Le contenu rendu d'un bloc, ou `null` s'il n'existe pas.
 *
 * Renvoyer `null` plutôt que de lever une erreur est délibéré : une section
 * dont le bloc n'est pas encore écrit disparaît de la page au lieu de casser
 * la compilation. C'est ce qui permet de mettre le site en ligne avec une
 * section de moins et de l'ajouter plus tard.
 */
export async function bloc(nom: string, langue: Langue) {
  const entree = await getEntry('blocs', `${langue}/${nom}`);
  if (!entree) return null;

  const { Content } = await render(entree);
  return { titre: entree.data.titre, Content };
}
