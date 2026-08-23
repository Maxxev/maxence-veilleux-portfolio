// Les réglages du site, validés une fois au démarrage.
//
// La validation n'est pas décorative : `settings.json` est le fichier que l'on
// modifie le plus souvent et le seul édité à la main. Une faute de frappe dans
// `contact.afficher` doit arrêter la compilation, pas révéler discrètement un
// courriel qu'on croyait masqué.
import brut from '../content/settings.json';
import { settingsSchema, type Settings } from '../schemas/settings.ts';

export const reglages: Settings = settingsSchema.parse(brut);

export const nom = reglages.nom;

/**
 * Les coordonnées sont-elles affichables?
 *
 * Un seul endroit répond à cette question, et tout le site l'interroge. C'est
 * ce qui garantit qu'aucun courriel ne subsiste dans un coin oublié quand
 * l'interrupteur est à `false`.
 */
export const contactVisible = reglages.contact.afficher;

/**
 * Les profils publics (GitHub, itch.io, YouTube) sont des preuves de travail
 * plutôt que des moyens de contact : ils survivent au masquage des coordonnées
 * si `afficherMalgreContactMasque` le permet.
 */
export const profilsVisibles =
  contactVisible || reglages.profils.afficherMalgreContactMasque;

/** Les profils réellement renseignés, dans l'ordre d'affichage voulu. */
export function profilsRenseignes(): { cle: 'github' | 'itch' | 'youtube'; url: string }[] {
  if (!profilsVisibles) return [];
  return (['github', 'itch', 'youtube'] as const)
    .map((cle) => ({ cle, url: reglages.profils[cle] }))
    .filter((profil) => profil.url.trim() !== '');
}

export const cvVisible = reglages.cv.afficher && reglages.cv.url.trim() !== '';
