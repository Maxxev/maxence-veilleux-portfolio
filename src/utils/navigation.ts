// La navigation du site : de la structure, pas du contenu. Elle reste donc en
// TypeScript plutôt que dans les dictionnaires — seuls les libellés sont
// traduits, et ils vivent sous `nav` dans src/i18n/.
import type { CleRoute } from '../i18n/routes.ts';
import type { Dictionnaire } from '../i18n/index.ts';

export type Lien = { cle: CleRoute; libelle: string };

/** Les liens de l'en-tête, dans l'ordre, pour une langue donnée. */
export function navigationPrincipale(t: Dictionnaire): Lien[] {
  return [
    { cle: 'accueil', libelle: t.nav.accueil },
    { cle: 'projets', libelle: t.nav.projets },
    { cle: 'parcours', libelle: t.nav.parcours },
  ];
}
