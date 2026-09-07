#!/usr/bin/env node
// Vérifie les contrastes de la palette contre les seuils WCAG 2.1.
//
// Pourquoi un script plutôt qu'une note dans le README : la palette est
// construite sur des rampes de luminosité absolue, donc changer une seule
// teinte déplace silencieusement une dizaine de paires. Les trois qui cassent
// en premier sont toujours les mêmes (le texte du bouton, le sur-titre et le
// lien en thème clair), et aucune des trois ne se voit à l'œil : elles passent
// de « tout juste conforme » à « tout juste non conforme ».
//
// Le script LIT `src/styles/_colors.scss` au lieu de redéclarer les couleurs.
// Une copie des valeurs dans ce fichier finirait par diverger de la feuille de
// style, et un vérificateur qui valide autre chose que ce qui est servi est
// pire qu'aucun vérificateur.
//
//   node scripts/verifier-contrastes.js
//   npm run verifier:contrastes

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(RACINE, 'src/styles/_colors.scss');

// --- Conversions ------------------------------------------------------------

function hslVersRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Luminance relative, WCAG 2.1 §relative luminance
function luminance([r, g, b]) {
  const canal = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(avant, arriere) {
  const a = luminance(avant);
  const b = luminance(arriere);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Une couleur translucide n'a pas de contraste en soi : elle en a un une fois
// posée sur ce qu'il y a derrière. C'est le cas des étiquettes et des bordures,
// définies en `hsla(...)` sur la surface de la page.
function composer(avant, alpha, arriere) {
  return avant.map((c, i) => c * alpha + arriere[i] * (1 - alpha));
}

// --- Lecture de _colors.scss ------------------------------------------------

const scss = readFileSync(SOURCE, 'utf8');

// Les rampes : @include m.generate-color-variants('primary', 16, 96%, 58%, 1);
const rampes = {};
for (const m of scss.matchAll(
  /generate-color-variants\(\s*'([\w-]+)'\s*,\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/g,
)) {
  rampes[m[1]] = { h: +m[2], s: +m[3], l: +m[4] };
}

// Les tokens sémantiques, par thème. On isole le corps de chaque mixin en
// comptant les accolades : une expression régulière gloutonne avalerait le
// mixin suivant.
function corpsDuMixin(nom) {
  const debut = scss.indexOf(`@mixin ${nom} {`);
  if (debut === -1) throw new Error(`mixin ${nom} introuvable dans _colors.scss`);
  let i = scss.indexOf('{', debut);
  let profondeur = 0;
  for (let j = i; j < scss.length; j++) {
    if (scss[j] === '{') profondeur++;
    else if (scss[j] === '}' && --profondeur === 0) return scss.slice(i + 1, j);
  }
  throw new Error(`accolade non refermée dans ${nom}`);
}

function tokensDe(nomMixin) {
  const tokens = {};
  for (const ligne of corpsDuMixin(nomMixin).split('\n')) {
    const m = ligne.match(/^\s*(--[\w-]+):\s*(.+?);\s*$/);
    if (m) tokens[m[1]] = m[2].trim();
  }
  return tokens;
}

// --- Résolution d'une valeur CSS en RGB -------------------------------------

function resoudre(valeur, tokens, arriere = null, profondeur = 0) {
  if (profondeur > 6) throw new Error(`référence circulaire : ${valeur}`);
  valeur = valeur.trim();

  // var(--secondary-90) : un barreau de rampe
  let m = valeur.match(/^var\((--[\w-]+)\)$/);
  if (m) {
    const nom = m[1];
    const barreau = nom.match(/^--([\w-]+?)-(\d+)$/);
    if (barreau && rampes[barreau[1]]) {
      const { h, s } = rampes[barreau[1]];
      return { rgb: hslVersRgb(h, s, +barreau[2]), alpha: 1 };
    }
    const base = nom.match(/^--([\w-]+)$/);
    if (base && rampes[base[1]]) {
      const { h, s, l } = rampes[base[1]];
      return { rgb: hslVersRgb(h, s, l), alpha: 1 };
    }
    if (tokens[nom]) return resoudre(tokens[nom], tokens, arriere, profondeur + 1);
    throw new Error(`token inconnu : ${nom}`);
  }

  // hsla(var(--secondary-h), var(--secondary-s), 80%, 0.14)
  m = valeur.match(/^hsla?\(([^)]*(?:\([^)]*\)[^)]*)*)\)$/);
  if (m) {
    const parts = m[1].split(',').map((p) => p.trim());
    const nombre = (p, suffixe = false) => {
      const v = p.match(/^var\(--([\w-]+)-([hsl])\)$/);
      if (v) {
        if (!rampes[v[1]]) throw new Error(`rampe inconnue : ${v[1]}`);
        return rampes[v[1]][v[2]];
      }
      return parseFloat(p);
    };
    const h = nombre(parts[0]);
    const s = nombre(parts[1]);
    const l = nombre(parts[2]);
    const a = parts[3] === undefined ? 1 : parseFloat(parts[3]);
    return { rgb: hslVersRgb(h, s, l), alpha: a };
  }

  throw new Error(`valeur non prise en charge : ${valeur}`);
}

// Un nom qui désigne une rampe (`--primary`, `--secondary-40`) plutôt qu'un
// token sémantique.
function rampeConnue(nom) {
  const barreau = nom.match(/^--([\w-]+?)-(\d+)$/);
  if (barreau && rampes[barreau[1]]) return true;
  const base = nom.match(/^--([\w-]+)$/);
  return Boolean(base && rampes[base[1]]);
}

// --- Les paires à vérifier --------------------------------------------------
//
// Chaque entrée dit ce qu'on regarde et à quel seuil. Les seuils ne sont pas
// tous 4,5:1 : WCAG accepte 3:1 pour du texte large (≥ 24 px, ou ≥ 18,7 px en
// gras) et pour les éléments d'interface non textuels. Un titre à 3,2:1 est
// conforme ; le même ratio sur un paragraphe ne l'est pas.
const PAIRES = [
  // texte, fond, seuil, note
  ['--text-color', '--surface-page', 4.5, 'texte courant'],
  ['--text-color', '--surface-raised', 4.5, 'texte sur carte'],
  ['--text-muted', '--surface-page', 4.5, 'texte secondaire'],
  ['--text-muted', '--surface-raised', 4.5, 'texte secondaire sur carte'],
  ['--heading-color', '--surface-page', 3, 'titres (texte large)'],
  ['--link-color', '--surface-page', 4.5, 'lien dans un paragraphe'],
  ['--link-color', '--surface-raised', 4.5, 'lien sur carte'],
  ['--link-color-hover', '--surface-page', 4.5, 'lien survolé'],
  ['--pre-heading-color', '--surface-page', 4.5, 'sur-titre'],
  ['--on-primary', '--primary', 4.5, 'texte du bouton plein'],
  ['--tag-color', '--tag-bg', 4.5, "texte d'étiquette", '--surface-raised'],
  ['--text-on-inverse', '--surface-inverse', 4.5, 'texte sur bloc inversé'],

  // L'anneau de focus, lui, est bien soumis au 3:1 de WCAG 1.4.11 : c'est le
  // seul indicateur qui dit à quelqu'un naviguant au clavier où il se trouve.
  // Il est dessiné en `--link-color` dans `_base.scss`.
  ['--link-color', '--surface-page', 3, 'anneau de focus (non textuel)'],

  // Informatif, sans seuil. Un filet de séparation ou une bordure de carte ne
  // porte aucune information : la carte est identifiée par son contenu, pas
  // par son contour. Les monter à 3:1 donnerait des traits durs qui vont à
  // l'encontre de toute la direction visuelle. On les affiche quand même,
  // parce qu'une bordure devenue invisible est un bogue même si elle est
  // conforme.
  ['--border-subtle', '--surface-page', null, 'bordure discrète (décor)'],
  ['--border-strong', '--surface-page', null, 'bordure marquée (décor)'],
];

// --- Exécution --------------------------------------------------------------

let echecs = 0;
const themes = [
  ['sombre (défaut)', tokensDe('dark-theme')],
  ['clair', tokensDe('light-theme')],
];

console.log('Contrastes de la palette, WCAG 2.1\n');
console.log(`Rampes lues dans ${SOURCE.replace(RACINE + '/', '')} :`);
for (const [nom, { h, s, l }] of Object.entries(rampes)) {
  if (nom === 'black' || nom === 'white') continue;
  console.log(`  ${nom.padEnd(10)} hsl(${h}, ${s}%, ${l}%)`);
}

for (const [nomTheme, tokens] of themes) {
  console.log(`\n─── Thème ${nomTheme} ${'─'.repeat(Math.max(0, 46 - nomTheme.length))}`);

  for (const [avantNom, arriereNom, seuil, note, sousJacentNom] of PAIRES) {
    // Une paire peut citer une rampe brute (`--primary`) et non un token
    // sémantique : l'aplat d'un bouton garde la même couleur dans les deux
    // thèmes, c'est justement ce qui permet à `--on-primary` d'être unique.
    const valeurDe = (nom) => tokens[nom] ?? (rampeConnue(nom) ? `var(${nom})` : null);
    const valAvant = valeurDe(avantNom);
    const valArriere = valeurDe(arriereNom);
    if (!valAvant || !valArriere) {
      console.log(`  ?  ${note} : token absent, paire ignorée`);
      continue;
    }
    try {
      // Le fond d'abord : il peut lui-même être translucide (les étiquettes
      // sont une teinte posée sur la surface de la carte).
      const sousJacent = sousJacentNom
        ? resoudre(tokens[sousJacentNom], tokens).rgb
        : [0, 0, 0];
      const fond = resoudre(valArriere, tokens);
      const rgbFond =
        fond.alpha < 1 ? composer(fond.rgb, fond.alpha, sousJacent) : fond.rgb;

      const texte = resoudre(valAvant, tokens);
      const rgbTexte =
        texte.alpha < 1 ? composer(texte.rgb, texte.alpha, rgbFond) : texte.rgb;

      const ratio = contraste(rgbTexte, rgbFond);
      if (seuil === null) {
        console.log(
          `  ·  ${ratio.toFixed(2).padStart(5)}:1  (informatif)  ${note}` +
            `\n         ${avantNom} sur ${arriereNom}`,
        );
        continue;
      }
      const ok = ratio >= seuil;
      if (!ok) echecs++;
      const marque = ok ? '✓' : '✗';
      console.log(
        `  ${marque}  ${ratio.toFixed(2).padStart(5)}:1  (min ${seuil})  ${note}` +
          `\n         ${avantNom} sur ${arriereNom}`,
      );
    } catch (e) {
      echecs++;
      console.log(`  ✗  ${note} : ${e.message}`);
    }
  }
}

console.log('');
if (echecs > 0) {
  console.error(
    `${echecs} paire(s) sous le seuil.\n\n` +
      'Le réflexe qui marche : ne touche pas à la teinte, déplace le barreau de\n' +
      'la rampe. `--link-color: var(--primary-35)` plutôt que `-40` corrige un\n' +
      'lien sans changer la couleur du site. Si une paire résiste, c\'est en\n' +
      'général que du texte clair a été posé sur un aplat vif : inverse-la et\n' +
      'mets du texte foncé (voir `--on-primary`).',
  );
  process.exit(1);
}
console.log('Toutes les paires passent.');
