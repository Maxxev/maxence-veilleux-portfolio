// Garde-fou de traduction.
//
// Un site bilingue pourrit toujours de la même façon : on ajoute un projet en
// français, on remet l'anglais à plus tard, et « plus tard » n'arrive jamais.
// Rien dans la compilation ne s'en plaint : la page anglaise affiche
// simplement un projet de moins, ce qui ne se voit pas.
//
//   npm run verifier:traductions
//
// Vérifie deux choses :
//   1. chaque contenu existe dans toutes les langues, avec le même slug
//   2. les deux dictionnaires ont exactement les mêmes clés
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANGUES = ['fr', 'en'];
const COLLECTIONS = ['projets', 'blocs'];

const problemes = [];

// --- 1. Les collections ----------------------------------------------------
for (const collection of COLLECTIONS) {
  const parLangue = {};

  for (const langue of LANGUES) {
    const dossier = join(RACINE, 'src', 'content', collection, langue);
    if (!existsSync(dossier)) {
      problemes.push(`Le dossier src/content/${collection}/${langue}/ n'existe pas.`);
      parLangue[langue] = new Set();
      continue;
    }
    parLangue[langue] = new Set(
      readdirSync(dossier)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
        .map((f) => f.replace(/\.md$/, '')),
    );
  }

  for (const langue of LANGUES) {
    for (const autre of LANGUES) {
      if (langue === autre) continue;
      for (const slug of parLangue[langue]) {
        if (!parLangue[autre].has(slug)) {
          problemes.push(
            `${collection} : « ${slug} » existe en ${langue} mais pas en ${autre} ` +
              `(src/content/${collection}/${autre}/${slug}.md manquant).`,
          );
        }
      }
    }
  }

  const total = parLangue[LANGUES[0]].size;
  console.log(`${collection} : ${total} entrée(s) × ${LANGUES.length} langue(s)`);
}

// --- 2. Les dictionnaires --------------------------------------------------
function clesPlates(objet, prefixe = '') {
  return Object.entries(objet).flatMap(([cle, valeur]) =>
    valeur && typeof valeur === 'object' && !Array.isArray(valeur)
      ? clesPlates(valeur, `${prefixe}${cle}.`)
      : [`${prefixe}${cle}`],
  );
}

const dictionnaires = Object.fromEntries(
  LANGUES.map((langue) => [
    langue,
    JSON.parse(readFileSync(join(RACINE, 'src', 'i18n', `${langue}.json`), 'utf8')),
  ]),
);

const reference = LANGUES[0];
const clesReference = new Set(clesPlates(dictionnaires[reference]));

for (const langue of LANGUES.slice(1)) {
  const cles = new Set(clesPlates(dictionnaires[langue]));

  for (const cle of clesReference) {
    if (!cles.has(cle)) problemes.push(`Dictionnaire ${langue} : clé « ${cle} » manquante.`);
  }
  for (const cle of cles) {
    if (!clesReference.has(cle)) problemes.push(`Dictionnaire ${langue} : clé « ${cle} » en trop.`);
  }
}

console.log(`dictionnaires : ${clesReference.size} clé(s) × ${LANGUES.length} langue(s)`);

// --- Verdict ---------------------------------------------------------------
if (problemes.length > 0) {
  console.error(`\n✗ ${problemes.length} problème(s) :\n`);
  problemes.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log('\n✓ Les langues sont alignées.');
