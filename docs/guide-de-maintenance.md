# Portfolio de Maxence Veilleux

Site bilingue construit avec [Astro](https://astro.build). Il remplace
`maxxev.github.io`, dont il reprend le contenu.

Le socle SCSS et les composants de mise en page viennent du projet
`cccc-maxxev`, avec une palette différente et une couche de tokens sémantiques
en plus (voir [Styles](#styles)).

## Démarrer

```bash
npm install
npm run dev        # serveur de développement
npm run build      # compile vers dist/, sert aussi de vérification de types
npm run preview    # sert dist/ localement
```

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm run verifier:traductions` | Refuse un contenu ou une clé qui n'existe que dans une langue |
| `npm run verifier:contrastes` | Mesure les contrastes de la palette dans les deux thèmes. Lit `_colors.scss`, ne redéclare rien |
| `npm run convertir:medias` | Réencode les médias de l'ancien portfolio (déjà fait, gardé pour trace) |
| `node scripts/generer-couvertures.js` | Régénère les couvertures abstraites des projets sans capture |
| `npm run verifier:interface` | Pilote le site dans Chromium : débordements, erreurs console, images, interactions. Demande `npm install --no-save playwright` |

`npx astro build` fait office de vérification de types. N'utilise pas
`astro check` : il n'est pas installé et propose d'ajouter deux dépendances.

## Modifier le contenu

**Rien de ce qui suit ne demande de toucher à un composant.**

### Ajouter ou modifier un projet

Un projet = **deux fichiers**, un par langue, avec le **même nom** :

```
src/content/projets/fr/mon-projet.md
src/content/projets/en/mon-projet.md
```

Copie un projet existant et remplace les champs. Le schéma commenté est dans
`src/schemas/projets.ts` : c'est lui qui fait foi, et un champ manquant ou mal
orthographié arrête la compilation avec un message qui le nomme.

Les champs qui décident de l'affichage :

- `ordre` : petit nombre = plus haut dans la grille. Jamais l'ordre des fichiers.
- `vedette: true` : remonte le projet sur l'accueil (les trois premiers par `ordre`).
- `categorie` : `pro`, `etudes` ou `perso`. Alimente les filtres.
- `role` : **ce que tu as fait toi**, à distinguer de ce que le projet est.
  C'est le champ que lit un employeur sur un travail d'équipe. Ne le laisse
  jamais vague.
- `mention` : le bandeau en tête de fiche. Sert à dire « sous entente de
  confidentialité » ou « pas encore en ligne » pour qu'une absence de lien se
  lise comme une contrainte et non comme un oubli.

Puis : `npm run verifier:traductions`.

### Ajouter une capture à un projet

Dépose l'image dans `public/medias/projets/`, puis dans les **deux** fichiers
Markdown :

```yaml
couverture:
  src: '/medias/projets/mon-projet.webp'
  alt: "Ce que l'image montre"
  position: '50% 50%'   # cadrage si l'image est rognée
```

Tous les projets ont aujourd'hui une vraie capture. `scripts/generer-couvertures.js`
reste dans le dépôt : il génère une couverture abstraite décorative pour un
projet qui n'en a pas encore, à retirer de la liste `SANS_CAPTURE` du script
une fois la vraie capture en place.

> Attention au YAML : si ton texte contient une apostrophe, utilise des
> guillemets **doubles**. `alt: 'l'IA'` casse la compilation.

### Changer un texte d'interface

Tout ce qui n'est pas un projet vit dans `src/i18n/fr.json` et `en.json`,
organisés par page. Les deux fichiers doivent avoir exactement les mêmes clés.

### Les paragraphes à hyperliens

`src/content/blocs/{fr,en}/` : du Markdown, pour les textes où tu veux glisser
un lien : la bio de l'accueil (`a-propos`), le mot sur l'agence (`agence`), le
paragraphe « au-delà du code » (`hors-dev`).

Un bloc absent fait disparaître sa section au lieu de casser la compilation :
tu peux mettre le site en ligne avec une section de moins.

### Les réglages

`src/content/settings.json`. Validé par `src/schemas/settings.ts`, qui explique
chaque champ.

## Les interrupteurs

Quatre booléens dans `settings.json` pilotent ce qui s'affiche.

### `contact.afficher`, l'exigence du Cégep

À `false`, **tout** moyen de te joindre disparaît du site : le bloc de contact,
les liens du pied de page, le CTA final, et le courriel dans les données
structurées JSON-LD. Un avis explique au visiteur que les coordonnées ont été
retirées.

C'est vérifiable en une commande :

```bash
npm run build && grep -r "@gmail" dist/ ; echo "aucune sortie = rien ne fuit"
```

**Repasse-le à `true` après l'évaluation.** Un portfolio sans moyen de contact
ne convertit pas un employeur, et c'est tout l'intérêt du CTA au bas de ton CV.

### `profils.afficherMalgreContactMasque`

GitHub, itch.io et YouTube sont des **preuves de travail** avant d'être des
moyens de te joindre. Cet interrupteur les garde visibles même quand les
coordonnées sont masquées. Un profil laissé à la chaîne vide n'apparaît pas :
c'est le cas de `youtube`, à remplir si tu veux le lien.

### `cv.afficher`

Dépose le PDF dans `public/`, mets `url` à `/le-nom-du-fichier.pdf`, passe
`afficher` à `true`. Deux boutons apparaissent : dans le hero et dans les blocs
de contact.

### `formation.coteR.afficher`

Affiche la cote R sur `/parcours` uniquement. Elle parle aux universités plus
qu'aux employeurs, d'où sa discrétion.

## Structure

```
src/
  components/        briques réutilisables
    pages/           le corps de chaque page, partagé fr/en
  content/
    projets/{fr,en}/ un Markdown par projet et par langue
    blocs/{fr,en}/   les paragraphes à hyperliens
    settings.json    les réglages
  data/              stack et distinctions (TypeScript typé)
  i18n/              dictionnaires + table des routes traduites
  layouts/           BaseLayout : métadonnées, thème, transitions
  pages/             déclaration des URL, rien d'autre
  schemas/           les schémas Zod, la source de vérité
  styles/            le socle SCSS + _texture.scss (grain, nappes, verre, relief)
  utils/             accès au contenu et aux réglages

depot-local/         boîte de dépôt IGNORÉE par Git : sources lourdes,
                     exports, captures. Rien n'en sort vers le site sans
                     passer par une conversion vers public/medias/.
```

Les fichiers de `src/pages/` sont volontairement de trois lignes. Ils déclarent
une URL et une langue ; la page vit dans `src/components/pages/`. C'est ce qui
empêche les versions française et anglaise de diverger.

## Ajouter une page

1. Une entrée dans `ROUTES` (`src/i18n/routes.ts`), avec l'URL dans chaque langue.
2. Le corps de la page dans `src/components/pages/`.
3. Deux fichiers de route : `src/pages/…` et `src/pages/en/…`.
4. Les libellés sous `nav` dans les deux dictionnaires.

L'en-tête, le pied de page et le sélecteur de langue suivent tout seuls.

## Styles

Le socle vient de `cccc-maxxev`. Ordre à respecter quand tu as besoin de style :

1. un composant existant (`Section`, `Container`, `Block`, `Button`, `Alert`…) ;
2. un mixin de `src/styles/_mixins.scss`, `_text.scss` ou `_texture.scss` ;
3. un `<style lang="scss">` scopé dans le composant.

Utilise les tokens, jamais des valeurs en dur : `--space-*`, `--radius-*`,
`--text-*`, `--h1`…`--h6`.

**Pour les couleurs, utilise la couche sémantique** : `--surface-page`,
`--surface-raised`, `--surface-sunken`, `--text-color`, `--text-muted`,
`--heading-color`, `--border-subtle`, `--border-strong`, `--link-color`,
`--on-primary`. Les rampes brutes (`--primary-40`, `--violet-95`) ont une
luminosité **absolue** et ne s'inversent pas d'un thème à l'autre. C'est la
seule règle qui compte : tant que tu restes sur la couche sémantique, le second
thème est gratuit.

### La direction visuelle, et d'où elle vient

Le site est la suite du CV, pas un document indépendant. Les couleurs ne sont
donc pas choisies à l'œil : elles sont **échantillonnées au pixel dans le PDF**,
parce que c'est le document que l'employeur a vu en premier.

| Relevé | Valeur | Rôle sur le site |
| --- | --- | --- |
| Barre latérale du CV | `hsl(270, 32%, 13%)` | le fond de page en sombre |
| Début du bandeau | `hsl(5, 100%, 63%)` | corail |
| Milieu du bandeau | `hsl(326, 99%, 62%)` | magenta |
| Fin du bandeau | `hsl(267, 99%, 64%)` | violet |

Le rendu de la souris (`public/medias/souris.webp`) raconte la même histoire :
orange `hsl(28, 100%, 60%)`, magenta `hsl(337, 64%, 52%)`, violet
`hsl(285, 65%, 29%)`. Les deux sources concordent, ce qui a validé la direction :
**chaud → magenta → violet**.

Ces trois arrêts vivent dans `--gradient-signature`, déclaré une seule fois. Il
traverse le site : le second mot du nom dans le hero, les initiales de
l'en-tête, le soulignement de navigation, le filet au-dessus du pied de page.

### Quatre matières, et où chacune s'arrête

`src/styles/_texture.scss` définit toute la matière du site. Aucune image,
aucun JavaScript, moins de 2 Ko de CSS.

**Les nappes** (`@include tx.aurora`) : quatre halos radiaux aux couleurs du CV,
posés de façon à ne se recouvrir qu'en partie. Les teintes intermédiaires ne
sont pas déclarées : elles apparaissent aux chevauchements. `--aurora-force`
module l'ensemble depuis l'extérieur : `1` pour le hero, `0,45` pour un en-tête
de page intérieure, `0,22` pour le pied de page.

**Le grain** (`@include tx.grain`) : un `feTurbulence` SVG en URI de données.
Il n'est pas décoratif : un dégradé sur un fond sombre montre toujours des
bandes, parce que l'écran manque de valeurs entre deux violets proches. Le bruit
les trame. C'est aussi pourquoi `--grain-opacite` est plus élevé en sombre.

**Le verre** (`@include tx.verre`) : trois ingrédients, et il en manque
généralement un dans les imitations : le flou d'arrière-plan, la
**sursaturation** (un vrai verre concentre la couleur qu'il laisse passer ;
sans elle, le flou donne un gris sale) et le **filet clair sur l'arête
supérieure**, qui fait lire une épaisseur plutôt qu'un rectangle translucide.

**Le relief** (`@include tx.relief`) : deux ombres opposées, et l'objet paraît
sortir de la surface. Réservé aux **boutons, à la bascule de thème et au
sélecteur de langue**. Rien d'autre.

### Pourquoi le relief ne va pas sur les cartes

C'est la décision structurante du système, et elle mérite d'être écrite parce
qu'elle sera tentante à défaire.

Un bouton est le seul objet d'une page dont on attend qu'il réponde au doigt.
Lui donner une épaisseur qui **s'enfonce au clic** ajoute de l'information :
l'état pressé devient visible sans recourir à la couleur.

Le même relief sur une carte n'ajoute rien. Il remplace un contour net par un
halo mou, ce qui coûte deux fois :

- une carte de projet est d'abord **un cadre autour d'une capture d'écran**, et
  un cadre flou rend l'image floue avec lui ;
- le relief encode le contour dans des écarts de luminosité de quelques pour
  cent, sous le seuil de perception d'une partie des visiteurs.

D'où la règle, qui tient en une ligne : **le relief là où on presse, le verre
là où on lit.**

### Le verre a besoin d'un fond, et parfois d'un voile

Une carte translucide posée sur un aplat uni ne montre rien, le flou n'a rien
à flouter. C'est pourquoi la carte du hero **chevauche** le rendu de la souris :
l'effet ne se comprend que là où il déforme quelque chose.

Le corollaire est un piège de contraste. Le rendu de la souris monte à 95 % de
luminosité ; un voile clair posé dessus éclaircit encore, et le texte clair de
la carte devient illisible. D'où un troisième token :

- `--glass-bg` : une carte posée sur le fond de page ;
- `--glass-bg-fort` : la même, plus dense ;
- `--glass-bg-lisible` : **dès que la carte chevauche un visuel dont tu ne
  contrôles pas la luminosité**. C'est un voile *sombre* en thème sombre et
  *clair* en thème clair, à l'inverse des deux autres. Mesuré au pire cas
  (la zone crème de la souris) : 6,3:1 pour le texte courant.

### Les contrastes se vérifient, ils ne s'estiment pas

```bash
npm run verifier:contrastes
```

Le script **lit `_colors.scss`** plutôt que de redéclarer les couleurs : un
vérificateur qui valide autre chose que ce qui est servi est pire qu'aucun
vérificateur. Il résout les rampes, les tokens sémantiques et les couleurs
translucides, qu'il compose sur leur fond avant de mesurer.

Il distingue trois régimes, parce que WCAG le fait :

- **4,5:1** pour le texte courant ;
- **3:1** pour le texte large et pour l'anneau de focus (WCAG 1.4.11) ;
- **informatif, sans seuil**, pour les bordures et filets décoratifs. Une carte
  est identifiée par son contenu, pas par son contour ; les monter à 3:1
  donnerait des traits durs qui contredisent toute la direction visuelle. Ils
  sont affichés quand même, parce qu'une bordure devenue invisible est un
  bogue même quand elle est conforme.

Si tu changes une teinte, **relance le script avant de commiter**. Le réflexe
qui marche n'est jamais de changer la teinte, mais de **déplacer le barreau de
la rampe** : `--link-color: var(--primary-35)` plutôt que `-40`.

### Le thème sombre est le défaut, sans condition

Le site ouvre en sombre **pour tout le monde**, y compris sur une machine
réglée en clair. `prefers-color-scheme` n'est consulté nulle part.

Ce n'est pas un oubli. La raison est éditoriale : la colonne d'identité du CV
est violet foncé, et la première image du site doit être la même sur toutes les
machines. Une préférence système respectée donnerait deux premières impressions
différentes selon le visiteur, ce qui est exactement ce qu'on cherche à éviter
quand on prolonge un document imprimé.

Conséquence pratique : le thème sombre est posé sur `:root` sans condition, et
seul `:root[data-theme='light']` le renverse. Un seul sélecteur au lieu de trois.
Si tu veux revenir au respect de la préférence système, c'est dans
`_colors.scss` (l'application des mixins, tout en bas), `BaseLayout.astro`
(script inline) et `ThemeToggle.astro` (le calcul de l'état courant). Les
trois doivent changer ensemble.

### La typographie

**Bricolage Grotesque** pour les titres, variable sur trois axes. C'est l'axe
`wdth` qui rend le hero possible : le nom s'étire pour remplir la ligne sans
être déformé. Élargir une police par `scaleX` étire aussi l'épaisseur des fûts
et donne l'impression d'un logo mal redimensionné ; l'axe de largeur redessine
les lettres.

`@include txt.display` est le registre « affiche » : le nom du hero, les titres
des deux pages d'index. Il n'est **pas** appliqué aux titres de fiches de
projet, qui peuvent faire huit mots et deviendraient illisibles en capitales.

Inter pour le texte courant, JetBrains Mono pour les étiquettes et métadonnées,
inchangés.

### Le piège des styles scopés d'Astro

Astro propage l'identifiant de portée du parent sur l'élément racine de
l'enfant. Un sélecteur qui traverse les deux doit donc vivre dans le **parent** :

```scss
/* Dans ProjetsGrid.astro : fonctionne, le <li> porte aussi la portée */
.projets-grid:has(.projet-card:hover) .projet-card:not(:hover) { … }
```

Écrite dans l'enfant avec `:global(…)`, cette règle ne produit **aucun CSS**.

## Choix techniques qui méritent une explication

- **Aucun script attaché directement à un élément.** Les transitions de vue
  remplacent le DOM à chaque navigation ; un `addEventListener` sur un bouton
  serait perdu en silence. Tout passe par la délégation sur `document`, ou par
  `astro:page-load`.
- **Le thème est appliqué par un script inline dans le `<head>`.** Différé, il
  peindrait le thème clair une image avant de basculer, le clignotement blanc
  qu'un mode sombre est censé éviter. Il est rejoué sur `astro:after-swap`,
  car une transition de vue remplace l'élément `<html>`.
- **Les animations d'apparition sont en CSS pur** (`animation-timeline: view()`).
  Les navigateurs qui l'ignorent affichent simplement le contenu.
- **La signature n'est pas une image** mais un aplat de couleur découpé par deux
  masques. Elle suit `currentColor`, donc reste visible en mode sombre. Un PNG
  noir aurait disparu.
- **Aucune vidéo ni iframe ne se charge avant un clic.** L'ancien site
  téléchargeait ~11 Mo au premier rendu.
- **Le grain est calculé par le navigateur, jamais cuit dans une image.** Ce
  n'est pas une préférence : c'est une mesure. Le générateur de couvertures
  composait le même bruit fractal en fusion « overlay », avec succès : écart-type
  de 1,34 sur la sortie PNG. Après encodage WebP à qualité 82, l'écart-type
  retombait à **0,00** : un codec avec pertes jette en priorité un bruit de
  faible amplitude et de haute fréquence, parce que l'œil ne le réclame pas.
  Conserver un tiers de l'effet aurait demandé la qualité 95 et des fichiers
  plus lourds, pour un grain invisible à la taille d'affichage. L'étape a donc
  été retirée plutôt que laissée à faire semblant.
- **Le hero et les en-têtes de page remontent sous la barre de navigation**
  (`margin-top` négatif compensé par le `padding`). L'en-tête est `sticky`,
  donc il occupe sa place dans le flux : sans ce décalage, les nappes de
  couleur s'arrêteraient à sa base et laisseraient un bandeau uni en haut de
  page. C'est aussi ce qui donne au verre de la barre quelque chose à flouter.
- **Le nom du hero est le `h1` lui-même**, agrandi, et non un nom décoratif
  posé derrière un titre. Poser les deux (ce que fait la référence dont
  s'inspire la mise en page) met deux fois le même texte dans le document, et
  un lecteur d'écran annonce « Maxence Veilleux Maxence Veilleux ».

## Déploiement

Netlify build et publie `dist/` à chaque commit sur `main`. Si le domaine
change un jour, mets à jour `site` dans `astro.config.mjs` : les URL
canoniques, les `hreflang` et le sitemap en dépendent.

## Ce qui reste à faire

Cherche `TODO Maxence` dans `src/` : chaque occurrence explique ce qui manque
et pourquoi ça compte. En résumé :

- Le **CV** en PDF, puis `cv.afficher: true`.
- L'URL de la **chaîne YouTube** dans `profils.youtube`, si tu la veux.
- Une **image de partage social** dans `public/medias/og/apercu.png`
  (1200 × 630). Sans elle, les liens partagés vers le site n'ont pas d'aperçu.
  Le rendu de la souris sur le dégradé du hero ferait une bonne base.
- Le **rendu de la souris** occupe le hero. C'est un objet que tu possèdes et
  qui donne son identité au site, mais ce n'est pas une preuve de ton travail
  de développeur. Il est monté pour être remplacé en une ligne : la balise
  `<img class="hero__souris">` dans `PageAccueil.astro`, et deux fichiers dans
  `public/medias/`. Si tu produis un visuel qui parle davantage de ce que tu
  fabriques, il prend sa place sans toucher au reste, les couleurs du site
  viennent du CV, pas de l'image.
- `contact.afficher: true`, une fois l'évaluation passée.
