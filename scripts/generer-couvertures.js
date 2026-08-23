// Couvertures de remplacement pour les projets sans capture d'écran.
//
//   node scripts/generer-couvertures.js
//
// Le problème qu'elles résolvent : trois cartes affichant un monogramme sur un
// aplat, côte à côte sur la page d'accueil, ne lisent pas « captures à venir ».
// Elles lisent « site inachevé » — et c'est la première chose que voit un
// employeur. Un visuel abstrait, lui, se lit comme un choix.
//
// Ces images sont volontairement NON informatives : elles décorent, le titre
// et le résumé sont dans le HTML juste en dessous. Elles sont donc à remplacer
// dès qu'une vraie capture existe, et rien ne casse quand on le fait — il
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

// Teintes de base, toutes dans la bande rouge → orange → ambre.
//
// Deux bornes apprises à l'œil, et pas déductibles de la théorie :
//
//   · au-dessus de ~40°, un jaune assombri ne devient pas « ambre foncé » mais
//     OLIVE. Le dégradé d'une couverture ambre partait donc dans le vert.
//   · en dessous de ~350°, on entre dans le magenta, et la couverture cesse de
//     se lire comme orange — ce qui est précisément ce qu'on cherche à éviter.
//
// D'où la règle du dégradé plus bas : la seconde teinte descend TOUJOURS vers
// le rouge, jamais vers le jaune. Orange → rouge profond s'assombrit
// proprement ; orange → ambre, non.
const TEINTES = [24, 12, 34, 2, 18];
const TEINTE_PLANCHER = 350; // sur l'axe déplié : 350 = -10°

/** Hachage stable d'une chaîne — même slug, même image, à chaque exécution. */
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

// `index` sert au choix du motif, `slug` à tout le reste.
//
// Le motif était tiré du même flux pseudo-aléatoire que les couleurs, et deux
// projets sur quatre tombaient sur les diagonales — quatre couvertures dont
// deux presque identiques. Passer par la position garantit qu'elles diffèrent
// tant qu'il y a moins de projets que de motifs, et ajouter un projet à la fin
// de la liste ne change pas les précédents.
async function couverture(slug, index) {
  const g = graine(slug);
  const rnd = aleatoire(g || 1);

  const teinte = TEINTES[g % TEINTES.length];
  // Décalage borné et signé : la seconde teinte reste une voisine de la
  // première, jamais une couleur d'une autre famille.
  // Toujours vers le rouge, jamais vers le jaune. On raisonne sur un axe
  // déplié pour que la soustraction traverse 0° sans repasser par 359.
  const deplie = teinte + 360;
  const brut = deplie - (12 + Math.floor(rnd() * 18));
  const teinte2 = Math.max(TEINTE_PLANCHER, brut) % 360;
  const motif = MOTIFS[index % MOTIFS.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}">
    <defs>
      <linearGradient id="fond" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${teinte}, 82%, 52%)" />
        <stop offset="52%" stop-color="hsl(${teinte2}, 72%, 36%)" />
        <stop offset="100%" stop-color="hsl(${teinte2}, 60%, 20%)" />
      </linearGradient>
      <radialGradient id="lueur" cx="74%" cy="22%" r="58%">
        <stop offset="0%" stop-color="hsl(${teinte}, 95%, 68%)" stop-opacity="0.5" />
        <stop offset="100%" stop-color="hsl(${teinte}, 95%, 68%)" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#fond)" />
    <g>${motif(rnd, teinte)}</g>
    <rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#lueur)" />
  </svg>`;

  const sortie = join(CIBLE, `${slug}.webp`);
  await sharp(Buffer.from(svg)).webp({ quality: 82, effort: 6 }).toFile(sortie);
  return sortie;
}

// Les projets sans capture réelle. Retire un slug de cette liste dès que le
// projet a une vraie image — le fichier généré n'a alors plus de raison d'être.
const SANS_CAPTURE = ['ludix', 'systemes-ia', 'sites-agence', 'amazoom'];

for (const [index, slug] of SANS_CAPTURE.entries()) {
  const fichier = await couverture(slug, index);
  console.log(`  ✓ ${fichier.replace(RACINE + '/', '')}`);
}
console.log('\nCes images sont décoratives. Remplace-les par de vraies captures dès que possible.');
