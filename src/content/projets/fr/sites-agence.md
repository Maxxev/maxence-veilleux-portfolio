---
titre: 'Sites vitrines et institutionnels'
resume: "Plusieurs sites livrés pour des clients d'agence : institutionnels, professionnels et communautaires, en Astro et en WordPress."
categorie: 'pro'
annee: '2025-2026'
role: "Intégration et développement front-end, architecture de contenu, et pour les refontes Astro, la conception du système de design."
ordre: 30
vedette: true
technos: ['Astro', 'SCSS', 'TypeScript', 'WordPress', 'Zod', 'Cloudflare']
faits:
  - "Sur les projets Astro, le contenu vit dans des collections typées par des schémas Zod : le client modifie du Markdown, jamais un composant, et une donnée mal formée casse la compilation au lieu de casser la page."
  - "Un socle SCSS partagé (jetons de couleur générés par rampes, échelle typographique fluide, couches de cascade explicites) plutôt qu'un cadriciel utilitaire. Ce portfolio est bâti sur ce même socle."
  - "Une section d'aperçu et sa page complète sont toujours alimentées par la même source et le même composant de grille."
  - 'Aussi plusieurs sites WordPress, du thème à la mise en ligne.'
couverture:
  src: '/medias/projets/sites-agence.webp'
  alt: 'Montage de plusieurs sites livrés en agence'
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: null
---

Une partie de mon travail rémunéré consiste à construire des sites pour les
clients d'une agence : des organisations institutionnelles, des professionnels,
des organismes communautaires. Le plus souvent des refontes : un site existant
qui a vieilli, qu'il faut reprendre sans perdre son contenu.

## Le contenu comme donnée typée

Sur les projets Astro, j'organise le contenu en collections validées par des
schémas Zod plutôt qu'en pages écrites en dur. Concrètement, ajouter un
événement ou un partenaire est un fichier Markdown à déposer, et un champ
oublié arrête la compilation avec un message qui dit lequel.

Le client peut toucher au contenu sans risquer de casser la mise en page, et
je n'ai pas à relire chaque changement.

## Un socle plutôt qu'un cadriciel

Je travaille sans Tailwind ni cadriciel CSS. Le socle est un ensemble de
jetons (rampes de couleur générées, échelle typographique fluide, espacements
calculés, couches de cascade déclarées) et une petite bibliothèque de mixins.

Ce portfolio est construit sur ce socle. Le mode sombre se bascule en haut de
cette page, et il n'a demandé aucune règle spécifique dans les composants :
seule une couche de jetons sémantiques a été redéfinie.

<!-- TODO Maxence : dès qu'un de ces sites est public, ajoute-le en projet
     distinct avec captures et lien. Un site en ligne vaut dix paragraphes. -->
