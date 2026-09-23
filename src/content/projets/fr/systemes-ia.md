---
titre: "Systèmes internes augmentés par l'IA"
resume: "Deux outils professionnels distincts où un modèle de langage fait une partie du travail : l'un propose des modifications de site sous forme de demandes de tirage, l'autre traite des courriels entrants jusqu'à leur saisie dans un système tiers."
categorie: 'pro'
annee: '2025'
role: "Conception et développement des deux systèmes : l'architecture des schémas partagés et le circuit de relecture pour l'assistant de contenu ; l'extraction structurée, la validation et l'automatisation du dépôt pour l'automate de demandes."
ordre: 20
vedette: true
technos:
  ['TypeScript', 'Zod', 'Astro', 'Cloudflare Workers', 'Python', 'Flask', 'Playwright', 'API Claude']
faits:
  - "Sur l'assistant de contenu, un schéma unique par type de contenu sert à trois endroits : validation à la compilation, définition de l'outil offert au modèle, et revalidation côté serveur avant écriture. Un contenu malformé ne peut donc pas atteindre un fichier."
  - "Le modèle n'y publie jamais directement : il propose. Chaque proposition devient une demande de tirage que le client relit avant de fusionner. L'émetteur YAML est écrit à la main pour que le diff ne bouge que d'une ligne quand une seule chose a changé."
  - "Sur l'automate de demandes, un courriel entrant est d'abord extrait par le modèle en mode outil (une structure de données, jamais du texte libre), puis passé à des règles de validation dures et à une détection de doublons avant d'être retenu."
  - "La saisie dans le système tiers est séparée de la réception du courriel : elle tourne en tâche récurrente, pilotée par navigateur automatisé, pour ne jamais faire dépendre l'accusé de réception d'une opération lente ou d'un service externe injoignable."
  - "Déployé comme service sur le serveur Windows du client plutôt que sur un hébergement infogéré : un seul processus pour ne pas dupliquer la session ouverte dans le système tiers, et des chemins de profil de navigateur qui doivent rester absolus pour survivre à une tâche planifiée."
couverture:
  src: '/medias/projets/systemes-ia.webp'
  alt: "Visuel abstrait représentant les systèmes internes augmentés par l'IA"
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: "Travail professionnel sur deux systèmes distincts, chez deux clients différents. Aucun n'est public : le premier reste sous entente de confidentialité, le second appartient à un client qui n'a pas autorisé sa divulgation. Ce qui est décrit ici se limite à l'architecture, sans nom de produit ni de client."
---

J'ai travaillé sur deux outils professionnels bien différents où un modèle de
langage prend en charge une partie du travail. Le premier, que j'appelle ici
**l'assistant de contenu**, permet à un client non technique de modifier son
site en le décrivant en français plutôt qu'en remplissant des formulaires. Le
second, **l'automate de demandes**, reçoit des courriels et les traite
jusqu'à leur saisie dans un système externe.

## L'assistant de contenu : empêcher l'invalide, pas juste produire du texte

Faire écrire du contenu à un modèle est facile. L'empêcher d'écrire du contenu
**invalide** est le vrai travail, et c'est de l'architecture, pas du prompt.

La réponse retenue tient en une contrainte : un seul schéma par type de
contenu, et il sert à trois choses à la fois. Astro le valide à la
compilation. Il devient le schéma d'entrée de l'outil offert au modèle, donc
le modèle ne peut pas produire une forme qu'il ne connaît pas. Et le serveur
le revalide avant d'écrire le fichier. Comme le seul chemin vers un fichier
traverse ce schéma, un contenu malformé ne peut pas arriver jusqu'au site.

Le modèle ne publie rien : il propose, et sa proposition devient une demande
de tirage que le client relit avant de fusionner. Cette relecture n'a de
valeur que si le diff est lisible, d'où un émetteur YAML écrit à la main
plutôt que repris d'une bibliothèque : ordre de clés, style de guillemets et
indentation stables garantissent qu'une seule ligne bouge quand une seule
chose a changé.

## L'automate de demandes : extraire, valider, puis seulement agir

Ce système reçoit un courriel, en extrait l'essentiel avec le modèle — en
mode outil, donc une structure de données définie plutôt qu'un texte libre —
puis fait passer cette extraction par des règles de validation dures et une
détection de doublons avant de retenir la demande.

La partie qui touche au système externe est volontairement séparée du reste :
elle ne se déclenche pas à la réception du courriel, mais en tâche
récurrente, et passe par un navigateur automatisé plutôt que par une API.
Cette séparation a deux effets. Elle évite qu'une opération de plusieurs
dizaines de secondes fasse expirer la requête qui a livré le courriel. Et
elle rend le système tolérant : si le service externe est injoignable, les
demandes s'accumulent et repartent seules dès qu'il répond.

Le déploiement a imposé ses propres contraintes. Le service tourne sur le
serveur Windows du client, pas sur un hébergement infogéré : un seul
processus, pour ne pas ouvrir deux sessions concurrentes dans le système
externe, et des chemins de profil de navigateur en absolu, pour survivre à
une tâche planifiée qui ne démarre pas toujours dans le même répertoire.
