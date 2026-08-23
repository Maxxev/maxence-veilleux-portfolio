// Vérification de l'interface dans un vrai navigateur.
//
//   npm run build && npm run verifier:interface
//
// Une capture d'écran ne prouve pas grand-chose : elle ne dit rien du
// débordement horizontal, des erreurs console, des images qui n'ont pas
// décodé, ni de ce qui se passe au clic. Ce script sert le dossier `dist/` et
// affirme ce que les captures cachent, puis les enregistre pour l'œil humain.
//
// Playwright n'est volontairement pas une dépendance du projet — il ne sert
// qu'ici. `npm install --no-save playwright` avant de lancer.
import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RACINE, 'dist');
const CAPTURES = process.env.CAPTURES ?? join(RACINE, '.captures');

if (!existsSync(DIST)) {
  console.error('dist/ est absent. Lance `npm run build` d’abord.');
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright est absent. Installe-le sans toucher au verrou :');
  console.error('  npm install --no-save playwright');
  process.exit(1);
}

await mkdir(CAPTURES, { recursive: true });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.xml': 'application/xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.pdf': 'application/pdf',
};

const serveur = createServer(async (requete, reponse) => {
  const chemin = decodeURIComponent(requete.url.split('?')[0]);
  let fichier = join(DIST, chemin);
  if (existsSync(fichier) && statSync(fichier).isDirectory()) {
    fichier = join(fichier, 'index.html');
  }
  if (!existsSync(fichier)) {
    // Servi AVEC un statut 404, comme le fera l'hébergeur : c'est ce qui rend
    // le test de la page d'erreur représentatif.
    fichier = join(DIST, '404.html');
    reponse.statusCode = 404;
  }
  try {
    reponse.setHeader('Content-Type', MIME[extname(fichier)] ?? 'application/octet-stream');
    reponse.end(await readFile(fichier));
  } catch {
    reponse.statusCode = 500;
    reponse.end('erreur');
  }
});
// Port 0 : le système en attribue un libre. Un port fixe entre en collision
// avec un `astro dev` laissé ouvert, et l'échec ne dit rien du site.
await new Promise((r) => serveur.listen(0, r));
const BASE = `http://localhost:${serveur.address().port}`;

const echecs = [];
function verifier(condition, message) {
  if (!condition) echecs.push(message);
  console.log(`${condition ? '  ✓' : '  ✗'} ${message}`);
}

/** Descend toute la page pour déclencher `loading="lazy"`, puis attend le décodage. */
async function chargerLesImages(page) {
  await page.evaluate(async () => {
    const pas = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await Promise.all(
      [...document.querySelectorAll('img')].map((image) =>
        image.complete
          ? null
          : new Promise((r) => {
              image.addEventListener('load', r, { once: true });
              image.addEventListener('error', r, { once: true });
            }),
      ),
    );
  });
  await page.waitForTimeout(250);
}

const PAGES = [
  ['accueil', '/'],
  ['projets', '/projets/'],
  ['projet-ludix', '/projets/ludix/'],
  ['projet-answerit', '/projets/answerit/'],
  ['parcours', '/parcours/'],
  ['en-accueil', '/en/'],
  ['en-projets', '/en/projects/'],
  ['404', '/chemin-qui-nexiste-pas'],
];
const LARGEURS = [390, 768, 1440];

const navigateur = await chromium.launch();

for (const [nom, chemin] of PAGES) {
  for (const largeur of LARGEURS) {
    const contexte = await navigateur.newContext({
      viewport: { width: largeur, height: 900 },
      colorScheme: 'light',
      reducedMotion: 'reduce',
    });
    const page = await contexte.newPage();

    const erreurs = [];
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      // La page 404 est servie avec un statut 404 : le navigateur le
      // journalise, et c'est le comportement correct, pas un défaut.
      if (nom === '404' && message.text().includes('404')) return;
      erreurs.push(message.text());
    });
    page.on('pageerror', (erreur) => erreurs.push(String(erreur)));

    await page.goto(`${BASE}${chemin}`, { waitUntil: 'networkidle' });

    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    verifier(debordement <= 0, `${nom} @${largeur} — aucun débordement horizontal (${debordement}px)`);
    verifier(
      erreurs.length === 0,
      `${nom} @${largeur} — aucune erreur console${erreurs.length ? ' : ' + erreurs[0] : ''}`,
    );

    if (largeur === 1440) {
      await chargerLesImages(page);
      const cassees = await page.evaluate(() =>
        [...document.querySelectorAll('img')]
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
      );
      verifier(
        cassees.length === 0,
        `${nom} — toutes les images décodées${cassees.length ? ' : ' + cassees[0] : ''}`,
      );
      await page.screenshot({ path: join(CAPTURES, `${nom}-clair.png`), fullPage: true });
    }
    await contexte.close();
  }
}

// --- Mode sombre -----------------------------------------------------------
for (const [nom, chemin] of [['accueil', '/'], ['projet-ludix', '/projets/ludix/'], ['parcours', '/parcours/']]) {
  const contexte = await navigateur.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await contexte.newPage();
  await page.goto(`${BASE}${chemin}`, { waitUntil: 'networkidle' });

  const fond = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  verifier(!/rgb\(2[45][0-9]/.test(fond), `${nom} sombre — le fond n'est pas resté clair (${fond})`);

  await chargerLesImages(page);
  await page.screenshot({ path: join(CAPTURES, `${nom}-sombre.png`), fullPage: true });
  await contexte.close();
}

// --- Interactions ----------------------------------------------------------
{
  const contexte = await navigateur.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await contexte.newPage();

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const avant = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(350);
  const apres = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  verifier(avant !== apres, `bascule de thème — le fond change (${avant} → ${apres})`);
  verifier(
    ['dark', 'light'].includes(await page.evaluate(() => localStorage.getItem('theme'))),
    'bascule de thème — le choix est mémorisé',
  );

  await page.goto(`${BASE}/projets/ludix/`, { waitUntil: 'networkidle' });
  await page.click('.lang-switcher');
  // `networkidle` ne suffit pas : une transition de vue ne génère aucun trafic
  // réseau, donc l'attente retomberait avant que l'URL ait changé.
  await page.waitForURL('**/en/projects/ludix/', { timeout: 5000 }).catch(() => {});
  verifier(
    page.url().endsWith('/en/projects/ludix/'),
    `sélecteur de langue — reste sur la même fiche (${page.url()})`,
  );

  await page.goto(`${BASE}/projets/`, { waitUntil: 'networkidle' });
  const total = await page.locator('.projet-card:visible').count();
  await page.click('[data-filtre="etudes"]');
  await page.waitForTimeout(150);
  const filtres = await page.locator('.projet-card:visible').count();
  verifier(filtres > 0 && filtres < total, `filtres — « Études » réduit la grille (${total} → ${filtres})`);

  await page.goto(`${BASE}/projets/answerit/`, { waitUntil: 'networkidle' });
  verifier(
    (await page.locator('video').first().getAttribute('preload')) === 'none',
    'vidéo — aucun préchargement avant le clic',
  );
  verifier(
    (await page.locator('.lite-yt iframe').count()) === 0,
    'YouTube — aucune iframe avant le clic',
  );

  const mobile = await navigateur.newContext({
    viewport: { width: 390, height: 800 },
    reducedMotion: 'reduce',
  });
  const pageMobile = await mobile.newPage();
  await pageMobile.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const replie = await pageMobile.locator('#nav-principale').evaluate((n) => n.getBoundingClientRect().height);
  await pageMobile.click('.burger');
  await pageMobile.waitForTimeout(350);
  const deploye = await pageMobile.locator('#nav-principale').evaluate((n) => n.getBoundingClientRect().height);
  verifier(deploye > replie, `menu mobile — s'ouvre au clic (${replie.toFixed(0)}px → ${deploye.toFixed(0)}px)`);
  await pageMobile.screenshot({ path: join(CAPTURES, 'accueil-mobile-menu.png') });
  await mobile.close();

  await contexte.close();
}

await navigateur.close();
serveur.close();

console.log(`\nCaptures : ${CAPTURES}`);
if (echecs.length > 0) {
  console.error(`\n✗ ${echecs.length} échec(s) :`);
  echecs.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('\n✓ Tout passe.');
