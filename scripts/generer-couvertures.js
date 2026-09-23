// Couvertures de remplacement pour les projets sans capture d'écran.
//
//   node scripts/generer-couvertures.js
//
// Le problème qu'elles résolvent : trois cartes affichant un monogramme sur un
// aplat, côte à côte sur la page d'accueil, ne lisent pas « captures à venir ».
// Elles lisent « site inachevé », et c'est la première chose que voit un
// employeur. Un visuel abstrait, lui, se lit comme un choix.
//
// Ces images sont volontairement NON informatives : elles décorent, le titre
// et le résumé sont dans le HTML juste en dessous. Elles sont donc à remplacer
// dès qu'une vraie capture existe, et rien ne casse quand on le fait : il
// suffit de changer `couverture.src` dans le Markdown du projet.
//
// Chaque composition est déterministe : le même slug donne toujours la même
// image, donc un projet ne change pas d'apparence entre deux exécutions.
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CIBLE = join(RACINE, 'public', 'medias', 'projets');
mkdirSync(CIBLE, { recursive: true });

const LARGEUR = 1200;
const HAUTEUR = 675;

// Les teintes : une tranche du dégradé signature, pas une famille de couleur.
//
// La version précédente restait dans la bande rouge → orange → ambre, avec
// deux garde-fous appris à l'œil : au-dessus de ~40° un jaune assombri vire à
// l'olive, et en dessous de ~350° on entrait « par erreur » dans le magenta.
//
// Ce second garde-fou n'a plus lieu d'être : le magenta et le violet SONT la
// palette maintenant, puisqu'ils viennent du bandeau du CV. On raisonne donc
// sur un axe déplié qui parcourt le dégradé signature d'un bout à l'autre :
//
//     365° corail   →   326° magenta   →   267° violet
//
// et chaque couverture en prélève un segment continu. Deux couvertures
// diffèrent par l'endroit où elles commencent, jamais par la famille : l'une
// sera corail-magenta, l'autre magenta-violet, et les deux appartiennent
// visiblement au même document que le CV.
//
// L'axe est décroissant et jamais ramené dans [0,360[ avant le rendu final :
// c'est ce qui permet de traverser 360° sans que la soustraction reparte à
// l'autre bout du cercle.
const AXE_DEBUT = 365; // corail
const AXE_FIN = 267; // violet
const AMPLITUDE = AXE_DEBUT - AXE_FIN;

/** Ramène une teinte de l'axe déplié dans l'intervalle CSS [0, 360[. */
function surLeCercle(h) {
  return ((h % 360) + 360) % 360;
}

/** Hachage stable d'une chaîne : même slug, même image, à chaque exécution. */
function graine(texte) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Générateur pseudo-aléatoire déterministe, amorcé par la graine. */
function aleatoire(etat) {
  let x = etat;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

// --- Les motifs ------------------------------------------------------------
// Chacun retourne du SVG posé par-dessus le dégradé de fond.

function arcs(rnd, teinte) {
  const cx = LARGEUR * (0.15 + rnd() * 0.2);
  const cy = HAUTEUR * (0.9 + rnd() * 0.3);
  return Array.from({ length: 7 }, (_, i) => {
    const r = 150 + i * (95 + rnd() * 30);
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}"
      fill="none" stroke="hsl(${teinte}, 70%, 96%)" stroke-width="${(1.5 + rnd() * 2).toFixed(1)}"
      opacity="${(0.28 - i * 0.03).toFixed(2)}" />`;
  }).join('');
}

function cartesEmpilees(rnd, teinte) {
  return Array.from({ length: 5 }, (_, i) => {
    const l = 300 + rnd() * 120;
    const h = 190 + rnd() * 90;
    const x = LARGEUR * 0.42 + i * 52 - rnd() * 20;
    const y = HAUTEUR * 0.2 + i * 44;
    const rot = -14 + i * 4;
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${l.toFixed(0)}" height="${h.toFixed(0)}"
      rx="18" fill="none" stroke="hsl(${teinte}, 75%, 96%)" stroke-width="2"
      opacity="${(0.34 - i * 0.05).toFixed(2)}"
      transform="rotate(${rot} ${(x + l / 2).toFixed(0)} ${(y + h / 2).toFixed(0)})" />`;
  }).join('');
}

function grillePoints(rnd, teinte) {
  const pas = 46;
  const points = [];
  for (let x = pas; x < LARGEUR; x += pas) {
    for (let y = pas; y < HAUTEUR; y += pas) {
      // Le rayon décroît avec la distance à un foyer : la grille respire.
      const dx = (x - LARGEUR * 0.68) / LARGEUR;
      const dy = (y - HAUTEUR * 0.35) / HAUTEUR;
      const d = Math.sqrt(dx * dx + dy * dy);
      const r = Math.max(0, 5.5 - d * 9) + rnd() * 0.6;
      if (r > 0.4) {
        points.push(
          `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="hsl(${teinte}, 70%, 97%)" opacity="0.4" />`,
        );
      }
    }
  }
  return points.join('');
}

function diagonales(rnd, teinte) {
  return Array.from({ length: 22 }, (_, i) => {
    const x = -HAUTEUR + i * 92 + rnd() * 18;
    return `<line x1="${x.toFixed(0)}" y1="0" x2="${(x + HAUTEUR).toFixed(0)}" y2="${HAUTEUR}"
      stroke="hsl(${teinte}, 80%, 92%)" stroke-width="${(1 + rnd() * 7).toFixed(1)}"
      opacity="${(0.14 + rnd() * 0.24).toFixed(2)}" />`;
  }).join('');
}

const MOTIFS = [arcs, cartesEmpilees, grillePoints, diagonales];

// --- Pourquoi il n'y a PAS de grain ici ------------------------------------
//
// Le fond du site est grainé, et une première version de ce script composait
// le même bruit fractal par-dessus chaque couverture, en fusion « overlay ».
// La composition fonctionnait : écart-type de 1,34 sur un aplat, mesuré sur la
// sortie PNG. Mais après encodage WebP à qualité 82, l'écart-type retombait à
// 0,00 : le grain avait purement et simplement disparu.
//
// C'est le comportement normal d'un codec avec pertes. Un bruit de faible
// amplitude et de haute fréquence est exactement ce qu'il est conçu à jeter en
// premier, parce que l'œil ne le réclame pas. Il aurait fallu monter à qualité
// 95 pour en conserver un tiers, et grossir chaque fichier pour un effet
// invisible à la taille où ces images sont affichées, 400 px de large dans
// une carte.
//
// La conclusion : le grain reste une affaire de CSS, calculée par le
// navigateur sur les fonds de page (voir `_texture.scss`). Une image n'a pas
// besoin d'en porter.
//
// La qualité est en revanche relevée à 90 : ces couvertures sont des dégradés
// lisses de synthèse, le cas précis où un encodeur produit des bandes
// visibles. Trois kilo-octets de plus par fichier, et elles disparaissent.
const QUALITE_WEBP = 90;

// `index` sert au choix du motif, `slug` à tout le reste.
//
// Le motif était tiré du même flux pseudo-aléatoire que les couleurs, et deux
// projets sur quatre tombaient sur les diagonales, quatre couvertures dont
// deux presque identiques. Passer par la position garantit qu'elles diffèrent
// tant qu'il y a moins de projets que de motifs, et ajouter un projet à la fin
// de la liste ne change pas les précédents.
async function couverture(slug, index, total) {
  const g = graine(slug);
  const rnd = aleatoire(g || 1);

  // Où commence le segment sur l'axe, et quelle longueur il parcourt.
  //
  // Le départ vient de la POSITION, pas du hachage, pour la même raison que
  // le motif juste en dessous, et l'erreur mérite d'être racontée : tirée du
  // hachage FNV, la valeur tombait entre 0,34 et 0,43 pour les quatre slugs
  // existants, et les quatre couvertures sortaient du même magenta. Un
  // hachage disperse bien sur des milliers d'entrées, pas sur quatre.
  //
  // Réparti par position, l'écart est garanti : chaque couverture occupe sa
  // part de l'axe, de la corail à la violette. Ajouter un projet redistribue
  // l'ensemble, ce qui est acceptable pour des images décoratives régénérées
  // en une commande.
  const depart = total > 1 ? (index / (total - 1)) * 0.62 : 0;
  const course = 0.3 + rnd() * 0.2;

  const teinteClaire = surLeCercle(AXE_DEBUT - depart * AMPLITUDE);
  const teinteFoncee = surLeCercle(
    AXE_DEBUT - Math.min(1, depart + course) * AMPLITUDE,
  );
  const motif = MOTIFS[index % MOTIFS.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}">
    <defs>
      <linearGradient id="fond" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${teinteClaire}, 92%, 58%)" />
        <stop offset="52%" stop-color="hsl(${teinteFoncee}, 80%, 40%)" />
        <stop offset="100%" stop-color="hsl(${teinteFoncee}, 68%, 22%)" />
      </linearGradient>
      <radialGradient id="lueur" cx="74%" cy="22%" r="58%">
        <stop offset="0%" stop-color="hsl(${teinteClaire}, 96%, 70%)" stop-opacity="0.5" />
        <stop offset="100%" stop-color="hsl(${teinteClaire}, 96%, 70%)" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#fond)" />
    <g>${motif(rnd, teinteClaire)}</g>
    <rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#lueur)" />
  </svg>`;

  const sortie = join(CIBLE, `${slug}.webp`);
  await sharp(Buffer.from(svg))
    .webp({ quality: QUALITE_WEBP, effort: 6 })
    .toFile(sortie);
  return sortie;
}

// Les projets sans capture réelle. Retire un slug de cette liste dès que le
// projet a une vraie image : le fichier généré n'a alors plus de raison d'être.
const SANS_CAPTURE = [];

for (const [index, slug] of SANS_CAPTURE.entries()) {
  const fichier = await couverture(slug, index, SANS_CAPTURE.length);
  console.log(`  ✓ ${fichier.replace(RACINE + '/', '')}`);
}
console.log('\nCes images sont décoratives. Remplace-les par de vraies captures dès que possible.');
