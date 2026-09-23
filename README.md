# Portfolio de Maxence Veilleux

Site personnel bilingue (français et anglais), construit avec [Astro](https://astro.build)
et un socle SCSS maison. Il remplace un ancien portfolio statique dont il reprend
le contenu, entièrement réécrit.

Étudiant en Techniques de l'informatique au Cégep de Sherbrooke, voie conception
et programmation. Ce dépôt est autant le site lui-même qu'un échantillon de ma
façon de travailler : j'y ai documenté les décisions plutôt que le code, parce que
c'est ce qui manque le plus souvent quand on reprend le projet de quelqu'un d'autre.

## Le parti pris

Un portfolio est le seul projet où le développeur est à la fois le client, le
concepteur et le mainteneur. Il est donc facile d'y bâcler ce qu'on ne s'autorise
pas ailleurs. J'ai choisi l'inverse : traiter le site comme une livraison, avec
les contraintes qui vont avec.

Trois d'entre elles ont structuré tout le reste.

**Le contenu ne doit jamais demander de toucher au code.** Un projet, c'est deux
fichiers Markdown, un par langue, validés par un schéma Zod qui arrête la
compilation en nommant le champ fautif. Les textes d'interface vivent dans deux
dictionnaires JSON. Les réglages du site (affichage du CV, des coordonnées, des
profils) sont quatre booléens dans un fichier de configuration. Rien de tout ça
ne suppose de comprendre Astro.

**Les deux langues ne doivent pas pouvoir diverger.** Les fichiers de
`src/pages/` font trois lignes : ils déclarent une URL et une langue, puis
délèguent à un composant de page partagé. Une seule implémentation, deux routes.
Un script de vérification refuse une clé de traduction ou un projet qui
n'existerait que d'un côté, et il tourne avant chaque commit de contenu.

**Ce qui se mesure ne s'estime pas.** Les contrastes de la palette sont vérifiés
par un script qui lit directement `_colors.scss` au lieu de redéclarer les
couleurs, résout les rampes et les tokens sémantiques, compose les couleurs
translucides sur leur fond, et applique les trois seuils WCAG selon le régime
(4,5:1 pour le texte courant, 3:1 pour le texte large et l'anneau de focus,
informatif pour les bordures décoratives). Un vérificateur qui valide autre chose
que ce qui est servi est pire que pas de vérificateur du tout.

## La direction visuelle vient du CV, pas de l'humeur

Le site est la suite du curriculum vitæ, pas un document indépendant. Les couleurs
ne sont donc pas choisies à l'œil : elles sont échantillonnées au pixel dans le
PDF, parce que c'est le document que l'employeur a vu en premier. La barre
latérale donne le fond de page en thème sombre ; le bandeau de titre donne les
trois arrêts du dégradé de signature, corail vers magenta vers violet. Le rendu 3D
qui occupe le hero contenait déjà la même progression, ce qui a confirmé la
direction au lieu de la contredire.

Ce dégradé est déclaré une seule fois et traverse le site : le second mot du nom
dans le hero, le logo de l'en-tête, le soulignement de navigation, le filet
au-dessus du pied de page.

La matière, elle, tient dans moins de 2 Ko de CSS, sans aucune image ni
JavaScript : des nappes de couleur en dégradés radiaux dont les teintes
intermédiaires naissent des chevauchements plutôt que d'être déclarées ; un grain
généré par `feTurbulence` qui existe pour une raison technique, tramer les bandes
qu'un dégradé sombre montre toujours faute de valeurs disponibles entre deux
violets voisins ; un verre dépoli qui combine flou, sursaturation et filet clair
sur l'arête, parce que sans les deux derniers un flou d'arrière-plan rend un gris
sale ; et un relief à deux ombres opposées.

Le relief est réservé aux boutons et aux contrôles, jamais aux cartes. Un bouton
est le seul objet dont on attend qu'il réponde au doigt, et une épaisseur qui
s'enfonce au clic ajoute de l'information. Sur une carte de projet, le même effet
remplace un cadre net par un halo mou autour d'une capture d'écran, et encode le
contour dans des écarts de luminosité de quelques pour cent, sous le seuil de
perception d'une partie des visiteurs. D'où la règle du système, qui tient en une
ligne : le relief là où on presse, le verre là où on lit.

Le thème sombre s'applique à tout le monde, y compris sur une machine réglée en
clair. `prefers-color-scheme` n'est consulté nulle part, et c'est délibéré :
quand un site prolonge un document imprimé, la première image doit être la même
pour tous. La bascule reste offerte, et le chemin de retour vers la préférence
système est documenté, trois fichiers à changer ensemble.

## Décisions techniques qui méritaient d'être écrites

Les transitions de vue d'Astro remplacent le DOM à chaque navigation. Un
`addEventListener` posé sur un bouton serait donc perdu en silence, sans erreur :
tout le comportement passe par la délégation sur `document` ou par
`astro:page-load`. Le thème, lui, est appliqué par un script inline dans le
`<head>` et rejoué sur `astro:after-swap` ; différé, il peindrait le thème clair
une image avant de basculer, exactement le clignotement blanc qu'un mode sombre
est censé éviter.

Le grain est calculé par le navigateur plutôt que cuit dans les images, et ce
n'est pas une préférence mais une mesure. Le générateur de couvertures composait
le même bruit fractal en fusion overlay avec succès, écart-type de 1,34 sur le
PNG. Après encodage WebP à qualité 82, l'écart-type retombait à 0,00 : un codec
avec pertes jette en priorité un bruit de faible amplitude et de haute fréquence,
parce que l'œil ne le réclame pas. Conserver un tiers de l'effet aurait demandé
la qualité 95 et des fichiers nettement plus lourds. L'étape a été retirée plutôt
que laissée à faire semblant.

Côté poids, aucune vidéo ni aucune iframe ne se charge avant un clic, les polices
sont auto-hébergées, et les animations d'apparition sont en CSS pur
(`animation-timeline: view()`), les navigateurs qui l'ignorent affichant
simplement le contenu. L'ancien site téléchargeait environ 11 Mo au premier rendu.

Le nom du hero est le `h1` lui-même, agrandi, et non un mot décoratif posé
derrière un titre. La mise en page dont je me suis inspiré fait cohabiter les
deux, ce qui met deux fois le même texte dans le document et fait annoncer
« Maxence Veilleux Maxence Veilleux » à un lecteur d'écran. De la même façon, la
signature du pied de page n'est pas une image mais un aplat découpé par deux
masques : elle suit `currentColor` et survit au changement de thème, là où un PNG
noir aurait disparu.

Enfin, une subtilité d'Astro qui m'a coûté une heure et qui est consignée pour la
prochaine fois : le composant parent propage son identifiant de portée sur
l'élément racine de l'enfant, donc un sélecteur qui traverse les deux doit vivre
dans le parent. Écrit dans l'enfant avec `:global(…)`, il ne produit aucun CSS.

## Structure

```
src/
  components/        briques réutilisables
    pages/           le corps de chaque page, partagé fr/en
  content/
    projets/{fr,en}/ un Markdown par projet et par langue
    blocs/{fr,en}/   les paragraphes qui admettent des hyperliens
    settings.json    les réglages du site
  data/              stack et distinctions, en TypeScript typé
  i18n/              dictionnaires et table des routes traduites
  layouts/           métadonnées, thème, transitions de vue
  pages/             déclaration des URL, rien d'autre
  schemas/           les schémas Zod, source de vérité du contenu
  styles/            socle SCSS, palette, matière
  utils/             accès au contenu et aux réglages
scripts/             les vérificateurs et les outils de média
```

## Faire tourner le projet

Node 22.12 ou plus récent.

```bash
npm install
npm run dev        # serveur de développement
npm run build      # compile vers dist/, et vaut vérification de types
npm run preview    # sert dist/ localement
```

| Vérification | Ce qu'elle garantit |
| --- | --- |
| `npm run verifier:traductions` | Aucun contenu ni aucune clé n'existe dans une seule langue |
| `npm run verifier:contrastes` | La palette respecte WCAG dans les deux thèmes |
| `npm run verifier:interface` | Pilote le site dans Chromium : débordements, erreurs console, images, interactions |

Le guide d'édition complet, la marche à suivre pour ajouter un projet, une page
ou une couleur, et le détail des réglages sont dans
[`docs/guide-de-maintenance.md`](docs/guide-de-maintenance.md).

## Déploiement

Chaque commit sur `main` déclenche un déploiement automatique sur Netlify.

---

Le code est consultable librement. Le contenu éditorial, les images et les
médias restent ma propriété.
