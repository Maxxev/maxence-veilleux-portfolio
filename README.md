# Portfolio — Maxence Veilleux

Site bilingue construit avec [Astro](https://astro.build). Il remplace
`maxxev.github.io`, dont il reprend le contenu.

Le socle SCSS et les composants de mise en page viennent du projet
`cccc-maxxev`, avec une palette différente et une couche de tokens sémantiques
en plus (voir [Styles](#styles)).

## Démarrer

```bash
npm install
npm run dev        # serveur de développement
npm run build      # compile vers dist/ — sert aussi de vérification de types
npm run preview    # sert dist/ localement
```

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm run verifier:traductions` | Refuse un contenu ou une clé qui n'existe que dans une langue |
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
`src/schemas/projets.ts` — c'est lui qui fait foi, et un champ manquant ou mal
orthographié arrête la compilation avec un message qui le nomme.

Les champs qui décident de l'affichage :

- `ordre` — petit nombre = plus haut dans la grille. Jamais l'ordre des fichiers.
- `vedette: true` — remonte le projet sur l'accueil (les trois premiers par `ordre`).
- `categorie` — `pro`, `etudes` ou `perso`. Alimente les filtres.
- `role` — **ce que tu as fait toi**, à distinguer de ce que le projet est.
  C'est le champ que lit un employeur sur un travail d'équipe. Ne le laisse
  jamais vague.
- `mention` — le bandeau en tête de fiche. Sert à dire « sous entente de
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

Les projets Ludix, Amazoom, « systèmes IA » et « sites d'agence » portent
aujourd'hui une **couverture abstraite générée**, purement décorative. Elles
sont là parce qu'une grille de cartes sans image lit « site inachevé ». Dès
que tu as une vraie capture, remplace `src` et retire le slug de la liste
`SANS_CAPTURE` dans `scripts/generer-couvertures.js`.

> Attention au YAML : si ton texte contient une apostrophe, utilise des
> guillemets **doubles**. `alt: 'l'IA'` casse la compilation.

### Changer un texte d'interface

Tout ce qui n'est pas un projet vit dans `src/i18n/fr.json` et `en.json`,
organisés par page. Les deux fichiers doivent avoir exactement les mêmes clés.

### Les paragraphes à hyperliens

`src/content/blocs/{fr,en}/` — du Markdown, pour les textes où tu veux glisser
un lien : la bio de l'accueil (`a-propos`), le mot sur l'agence (`agence`), le
paragraphe « au-delà du code » (`hors-dev`).

Un bloc absent fait disparaître sa section au lieu de casser la compilation :
tu peux mettre le site en ligne avec une section de moins.

### Les réglages

`src/content/settings.json`. Validé par `src/schemas/settings.ts`, qui explique
chaque champ.

## Les interrupteurs

Quatre booléens dans `settings.json` pilotent ce qui s'affiche.

### `contact.afficher` — l'exigence du Cégep

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
coordonnées sont masquées. Un profil laissé à la chaîne vide n'apparaît pas —
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
  schemas/           les schémas Zod — la source de vérité
  styles/            le socle SCSS
  utils/             accès au contenu et aux réglages
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
2. un mixin de `src/styles/_mixins.scss` ou `_text.scss` ;
3. un `<style lang="scss">` scopé dans le composant.

Utilise les tokens, jamais des valeurs en dur : `--space-*`, `--text-*`,
`--h1`…`--h6`.

**Pour les couleurs, utilise la couche sémantique** — `--surface-page`,
`--surface-raised`, `--surface-sunken`, `--text-color`, `--text-muted`,
`--heading-color`, `--border-subtle`, `--border-strong`, `--link-color`,
`--on-primary`. Les rampes brutes (`--primary-40`, `--secondary-95`) ont une
luminosité **absolue** et ne s'inversent pas en mode sombre. C'est la seule
règle qui compte : tant que tu restes sur la couche sémantique, le mode sombre
est gratuit.

### La palette, et pourquoi le texte des boutons est foncé

Orange vif `hsl(24, 94%, 56%)` en primaire, neutre chaud à 26° pour toute la
structure, rose profond en accent pour les dégradés.

Le neutre chaud compte plus que l'orange : un accent orange posé sur des gris
froids donne un site banal. C'est lui qui produit le fond papier en clair et le
noir chaud en sombre.

**Le texte sur un aplat orange est foncé, pas blanc** (`--on-primary`). Ce n'est
pas un goût, c'est une mesure : un orange assez vif pour être la couleur d'un
site ne dépasse jamais 3:1 avec du blanc. Pour atteindre 4,5:1 il faudrait
descendre à L≤43 %, et l'orange devient alors une rouille terne. Texte foncé sur
orange vif : 6,5:1. Même raison pour les liens en thème clair, à `--primary-35`
et non `-40`.

Si tu changes la teinte primaire, **revalide les contrastes** avant de commiter.
Les paires qui cassent en premier sont toujours les mêmes : le texte du bouton,
le sur-titre et le lien en thème clair.

### Le piège des styles scopés d'Astro

Astro propage l'identifiant de portée du parent sur l'élément racine de
l'enfant. Un sélecteur qui traverse les deux doit donc vivre dans le **parent** :

```scss
/* Dans ProjetsGrid.astro — fonctionne, le <li> porte aussi la portée */
.projets-grid:has(.projet-card:hover) .projet-card:not(:hover) { … }
```

Écrite dans l'enfant avec `:global(…)`, cette règle ne produit **aucun CSS**.

## Choix techniques qui méritent une explication

- **Aucun script attaché directement à un élément.** Les transitions de vue
  remplacent le DOM à chaque navigation ; un `addEventListener` sur un bouton
  serait perdu en silence. Tout passe par la délégation sur `document`, ou par
  `astro:page-load`.
- **Le thème est appliqué par un script inline dans le `<head>`.** Différé, il
  peindrait le thème clair une image avant de basculer — le clignotement blanc
  qu'un mode sombre est censé éviter. Il est rejoué sur `astro:after-swap`,
  car une transition de vue remplace l'élément `<html>`.
- **Les animations d'apparition sont en CSS pur** (`animation-timeline: view()`).
  Les navigateurs qui l'ignorent affichent simplement le contenu.
- **La signature n'est pas une image** mais un aplat de couleur découpé par deux
  masques. Elle suit `currentColor`, donc reste visible en mode sombre — un PNG
  noir aurait disparu.
- **Aucune vidéo ni iframe ne se charge avant un clic.** L'ancien site
  téléchargeait ~11 Mo au premier rendu.

## Déploiement

Rien n'est configuré : c'est une décision en attente. `public/CNAME` contient
toujours `maxenceveilleux.com` pour que GitHub Pages reste branchable.

- **GitHub Pages** — un workflow qui lance `npm run build` et publie `dist/`.
  Le CNAME est déjà en place.
- **Cloudflare Pages** — commande `npm run build`, dossier `dist`, et le DNS de
  `maxenceveilleux.com` à repointer.

Dans les deux cas, mets à jour `site` dans `astro.config.mjs` si le domaine
change : les URL canoniques, les `hreflang` et le sitemap en dépendent.

## Ce qui reste à faire

Cherche `TODO Maxence` dans `src/` — chaque occurrence explique ce qui manque
et pourquoi ça compte. En résumé :

- Des **captures** pour Ludix et Amazoom. Ce sont les deux projets qui perdent
  le plus à ne pas en avoir.
- Le **CV** en PDF, puis `cv.afficher: true`.
- L'URL de la **chaîne YouTube** dans `profils.youtube`, si tu la veux.
- Java ou Kotlin pour Ludix : `src/data/stack.ts` liste les deux, retire celui
  qui ne s'applique pas.
- Une **image de partage social** dans `public/medias/og/apercu.png`
  (1200 × 630). Sans elle, les liens partagés vers le site n'ont pas d'aperçu.
- `contact.afficher: true`, une fois l'évaluation passée.
