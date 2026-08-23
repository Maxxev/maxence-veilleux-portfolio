// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://maxenceveilleux.com',

  // Le français est la langue par défaut et vit à la racine (`/projets`).
  // L'anglais est préfixé (`/en/projects`). Voir src/i18n/ pour les
  // dictionnaires et src/i18n/routes.ts pour la correspondance des URL.
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  integrations: [icon(), sitemap({ i18n: { defaultLocale: 'fr', locales: { fr: 'fr-CA', en: 'en-CA' } } })],

  build: {
    // Une seule feuille de style pour un site de cette taille : moins de
    // requêtes qu'un fichier CSS par page, et le socle SCSS est partagé partout.
    inlineStylesheets: 'auto',
  },
});
