---
titre: 'Ludix'
resume: "Une boutique de jeux vidéo en deux clients, une application Android et un back-office web, servis par une seule API REST."
categorie: 'etudes'
annee: '2026'
role: "Responsable de l'interface et du design system, de la maquette Figma jusqu'à son implémentation dans les deux clients."
ordre: 10
vedette: true
technos: ['Laravel', 'PHP', 'Android Studio', 'API REST', 'MySQL', 'Figma']
faits:
  - "Deux clients pour une seule API : l'application Android et le site d'administration consomment les mêmes points d'accès REST, ce qui a imposé de fixer les contrats de données avant d'écrire les écrans."
  - "Un back-office authentifié où les administrateurs gèrent les produits, les commentaires, les événements et les comptes utilisateurs."
  - "J'ai monté la bibliothèque de composants réutilisables dans Figma, puis je l'ai portée deux fois : en composants Blade côté Laravel, en layouts et vues côté Android."
  - "Travail à quatre. J'ai passé une part importante du projet à débloquer mes coéquipiers sur leur propre code."
  - "Dix semaines en cascade : cahier des charges, tableau des fonctionnalités et diagramme de contexte d'abord, puis cinq semaines de développement (deux pour le site, deux pour l'application, une semaine tampon). Le déploiement n'était pas au programme."
couverture:
  src: '/medias/projets/ludix.webp'
  alt: 'Visuel abstrait représentant le projet Ludix'
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: "Projet scolaire réalisé en équipe au Cégep de Sherbrooke. Le dépôt n'est pas public."
---

Ludix est une boutique de jeux vidéo fictive, construite comme un système
complet plutôt que comme un seul livrable : une application mobile pour les
clients, un site d'administration pour la boutique, et une API REST entre
les deux.

## Ce que la double cible a changé

Écrire deux clients contre une même API force une discipline qu'un projet
mono-client ne demande jamais. Un champ renommé côté Laravel casse
l'application Android, et l'inverse est vrai. Nous avons donc figé les
contrats de données avant de dessiner les écrans.

## Le design system

J'ai commencé par Figma : une bibliothèque de composants (boutons, cartes
produit, champs de formulaire, états de chargement) avec leurs variantes.
Puis je l'ai implémentée deux fois, en composants Blade côté web et en vues
réutilisables côté Android.

Porter le même système dans deux technologies apprend vite ce qui, dans une
maquette, relève du principe et ce qui relève du détail. Une couleur ou un
espacement se transposent sans réfléchir ; un comportement de survol, non : il
n'existe pas sur mobile, et il faut décider par quoi le remplacer.

## Une cascade, volontairement

Le projet a duré dix semaines, dont cinq seulement de développement : deux
pour le site, deux pour l'application, une semaine tampon. Le reste est passé
en amont, en cascade classique : cahier des charges, tableau des
fonctionnalités, diagramme de contexte, répartition des tâches et estimation
du temps, avant d'écrire la moindre ligne de code.

Le produit final n'a pas été déployé ; ce n'était pas l'objet du cours.
J'ai depuis comblé ce manque sur d'autres projets, notamment une application
Laravel livrée en intégration et déploiement continus.
