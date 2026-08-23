// L'accès aux traductions.
//
// Les dictionnaires sont typés d'après le français : `fr.json` est la source
// de vérité de la *forme*. Une clé utilisée dans une page mais absente du
// dictionnaire casse la compilation, et `npm run verifier:traductions` refuse
// un anglais qui aurait pris du retard.
import fr from './fr.json';
import en from './en.json';
import { LANGUE_DEFAUT, type Langue } from './routes.ts';

export type Dictionnaire = typeof fr;

const DICTIONNAIRES = { fr, en } satisfies Record<Langue, Dictionnaire>;

/** Le dictionnaire complet d'une langue. Utilisé tel quel : `t.accueil.titre`. */
export function traductions(langue: Langue): Dictionnaire {
  return DICTIONNAIRES[langue] ?? DICTIONNAIRES[LANGUE_DEFAUT];
}

export { LANGUE_DEFAUT, LANGUES, type Langue } from './routes.ts';
export {
  ROUTES,
  chemin,
  cheminProjet,
  cheminTraduit,
  langueDepuisUrl,
  type CleRoute,
} from './routes.ts';

/**
 * Le mois et l'année d'une chaîne « AAAA-MM », dans la langue voulue.
 * Sert aux dates de formation, qui n'ont pas de jour.
 */
export function moisAnnee(valeur: string, langue: Langue): string {
  const [annee, mois] = valeur.split('-').map(Number);
  const date = new Date(Date.UTC(annee, mois - 1, 1));
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
