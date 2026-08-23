// Conversion des médias de l'ancien portfolio vers des formats servables.
//
// L'ancien site servait 76 Mo de vidéos et 7,6 Mo de PNG, dont une bannière de
// 10,8 Mo en lecture automatique. Ce script est la trace reproductible de ce
// qui a été fait pour ramener ça à quelques centaines de kilooctets.
//
//   node scripts/convertir-medias.js
//
// Il lit `maxxev-github-io-REFERENCE/` (lien symbolique en lecture seule vers
// l'ancien dépôt, hors du dépôt courant) et écrit dans `public/medias/`.
// Il ne modifie jamais la source. Il saute ce qui existe déjà : relancer le
// script est sans effet, sauf avec --force.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(RACINE, 'maxxev-github-io-REFERENCE');
const CIBLE = join(RACINE, 'public', 'medias');
const FORCE = process.argv.includes('--force');

// ffmpeg n'est pas une dépendance du projet : il ne sert qu'ici, une fois. On
// l'installe à la demande avec `npm install --no-save ffmpeg-static`.
function binaireFfmpeg() {
  const chemin = join(RACINE, 'node_modules', 'ffmpeg-static', 'ffmpeg');
  if (!existsSync(chemin)) {
    throw new Error(
      "ffmpeg est introuvable. Installe-le sans toucher au verrou de dépendances :\n" +
        '  npm install --no-save ffmpeg-static\n' +
        '  node node_modules/ffmpeg-static/install.js',
    );
  }
  return chemin;
}

function ffmpeg(args) {
  execFileSync(binaireFfmpeg(), ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}

function ko(chemin) {
  return `${Math.round(statSync(chemin).size / 1024)} ko`;
}

function aFaire(sortie) {
  if (FORCE || !existsSync(sortie)) return true;
  console.log(`  · ${sortie.replace(RACINE + '/', '')} existe déjà, ignoré`);
  return false;
}

mkdirSync(CIBLE, { recursive: true });

// --- 1. La signature -------------------------------------------------------
// Le GIF de 375 ko contient 90 images pour un seul dessin. On ne garde que la
// dernière : l'animation d'écriture est refaite en CSS, par un masque qui
// balaie l'image de gauche à droite (voir src/components/Signature.astro).
// Résultat : ~10 ko, et la signature prend la couleur du texte, donc elle
// reste visible en mode sombre — ce qu'un PNG noir ne ferait pas.
async function signature() {
  const sortie = join(CIBLE, 'signature.webp');
  if (!aFaire(sortie)) return;

  const temporaire = join(CIBLE, '.signature-brute.png');
  ffmpeg([
    '-i', join(SOURCE, 'media', 'signature.gif'),
    // Sur un GIF, `-update 1` réécrit la même sortie à chaque image : le
    // fichier final contient donc la dernière, celle où le tracé est complet.
    '-update', '1',
    temporaire,
  ]);

  await sharp(temporaire)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(sortie);

  execFileSync('rm', ['-f', temporaire]);
  console.log(`  ✓ signature.webp (${ko(sortie)})`);
}

// --- 2. Les images de graphisme -------------------------------------------
async function graphisme() {
  const dossier = join(CIBLE, 'graphisme');
  mkdirSync(dossier, { recursive: true });

  for (let i = 0; i <= 10; i += 1) {
    const entree = join(SOURCE, 'images', 'graphisme', `${i}.png`);
    const sortie = join(dossier, `${i}.webp`);
    if (!existsSync(entree) || !aFaire(sortie)) continue;

    await sharp(entree)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(sortie);
    console.log(`  ✓ graphisme/${i}.webp (${ko(sortie)})`);
  }
}

// --- 3. Les vidéos ---------------------------------------------------------
// Réencodées en 720p H.264, CRF 30, audio coupé (aucune n'a de son utile).
// `faststart` place l'index en tête du fichier : sans lui, le navigateur doit
// télécharger la vidéo entière avant d'afficher la première image.
const VIDEOS = [
  { source: 'answerit.mp4', nom: 'answerit' },
  { source: 'oups_gameplay.mp4', nom: 'oups' },
  { source: 'just_sleep_gameplay.mp4', nom: 'just-sleep' },
];

async function videos() {
  const dossier = join(CIBLE, 'videos');
  mkdirSync(dossier, { recursive: true });

  for (const { source, nom } of VIDEOS) {
    const entree = join(SOURCE, 'media', source);
    if (!existsSync(entree)) {
      console.log(`  ! ${source} introuvable, ignorée`);
      continue;
    }

    const sortie = join(dossier, `${nom}.mp4`);
    if (aFaire(sortie)) {
      ffmpeg([
        '-i', entree,
        '-vf', "scale='min(1280,iw)':-2",
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '30',
        '-profile:v', 'high',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-an',
        sortie,
      ]);
      console.log(`  ✓ videos/${nom}.mp4 (${ko(entree)} → ${ko(sortie)})`);
    }

    // L'image d'affiche : c'est le seul octet téléchargé avant que le visiteur
    // clique. Prise à 1 s plutôt qu'à 0 s, où beaucoup de vidéos sont noires.
    const affiche = join(dossier, `${nom}.webp`);
    if (aFaire(affiche)) {
      const temporaire = join(dossier, `.${nom}-affiche.png`);
      ffmpeg(['-ss', '1', '-i', entree, '-frames:v', '1', temporaire]);
      await sharp(temporaire)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 72, effort: 6 })
        .toFile(affiche);
      execFileSync('rm', ['-f', temporaire]);
      console.log(`  ✓ videos/${nom}.webp (${ko(affiche)})`);
    }
  }
}

console.log('Signature');
await signature();
console.log('Graphisme');
await graphisme();
console.log('Vidéos');
await videos();
console.log('\nTerminé.');
