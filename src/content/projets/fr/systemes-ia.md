---
titre: "Systèmes internes augmentés par l'IA"
resume: "Plusieurs outils internes où un modèle de langage fait une partie du travail, sous une architecture qui l'empêche de produire quoi que ce soit d'invalide."
categorie: 'pro'
annee: '2025'
role: "Conception et développement. Sur le gestionnaire de contenu, l'architecture des schémas partagés et le circuit de relecture."
ordre: 20
vedette: true
technos: ['TypeScript', 'Zod', 'Astro', 'Cloudflare Workers', 'API Claude']
faits:
  - "Un schéma unique par type de contenu, utilisé à trois endroits : validation à la compilation, définition de l'outil offert au modèle, et revalidation côté serveur avant écriture. Un contenu malformé ne peut donc pas atteindre un fichier, parce que le seul chemin vers un fichier passe par ce schéma."
  - "Le modèle ne publie jamais directement : il propose. Chaque proposition devient une demande de tirage que le client relit avant de fusionner."
  - "Pour que ces diffs soient lisibles, l'émetteur YAML est écrit à la main plutôt que repris d'une bibliothèque : ordre de clés, style de guillemets et indentation stables garantissent qu'une seule ligne bouge quand une seule chose a changé."
  - "Zone d'écriture restreinte par liste blanche de chemins, avec un catalogue de formats autorisés par dossier — la question « que peut-on téléverser, et où » a une seule réponse dans le code."
couverture:
  src: '/medias/projets/systemes-ia.webp'
  alt: "Visuel abstrait représentant les systèmes internes augmentés par l'IA"
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: "Travail professionnel. Ces systèmes ne sont pas publics : l'un est encore en développement, les autres sont couverts par une entente de confidentialité. Ce qui est décrit ici se limite à l'architecture, sans nom de produit ni de client."
---

J'ai travaillé sur plus d'un outil interne où un modèle de langage prend en
charge une partie du travail. Le plus abouti est un **gestionnaire de contenu**
qui permet à un client non technique de modifier son site en le décrivant en
français, plutôt qu'en remplissant des formulaires.

## Le problème réel n'est pas le modèle

Faire écrire du contenu à un modèle est facile. L'empêcher d'écrire du contenu
**invalide** est le vrai travail, et c'est de l'architecture, pas du prompt.

La réponse retenue tient en une contrainte : un seul schéma par type de
contenu, et il sert à trois choses à la fois. Astro le valide à la compilation.
Il devient le schéma d'entrée de l'outil offert au modèle, donc le modèle ne
peut pas produire une forme qu'il ne connaît pas. Et le serveur le revalide
avant d'écrire le fichier. Comme le seul chemin vers un fichier traverse ce
schéma, un contenu malformé ne peut pas arriver jusqu'au site.

## Le client garde la main

Le modèle ne publie rien. Il propose, et sa proposition devient une demande de
tirage que le client relit avant de fusionner. Ça change la nature de l'outil :
ce n'est pas une IA qui gère le site, c'est une IA qui rédige des suggestions
qu'un humain accepte ou rejette.

Cette relecture n'a de valeur que si le diff est lisible. C'est pour ça que
l'émetteur YAML est écrit à la main au lieu d'utiliser celui d'une
bibliothèque : un ordre de clés, un style de guillemets et une indentation
stables font qu'une seule ligne bouge dans le diff quand une seule chose a
changé. Un émetteur générique réordonne les clés et transforme la relecture en
recherche de l'aiguille.
