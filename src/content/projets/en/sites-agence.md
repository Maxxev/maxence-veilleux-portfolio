---
titre: 'Showcase and institutional websites'
resume: 'Several sites delivered for agency clients: institutional, professional and community organisations, in Astro and WordPress.'
categorie: 'pro'
annee: '2024-2025'
role: 'Front-end development and integration, content architecture, and on the Astro rebuilds, the design system itself.'
ordre: 30
vedette: true
technos: ['Astro', 'SCSS', 'TypeScript', 'WordPress', 'Zod', 'Cloudflare']
faits:
  - 'On the Astro projects, content lives in collections typed by Zod schemas: the client edits Markdown, never a component, and malformed data breaks the build instead of breaking the page.'
  - 'A shared SCSS foundation (colour tokens generated as ramps, a fluid type scale, explicit cascade layers) rather than a utility framework. This portfolio is built on that same foundation.'
  - 'A preview section and its full page are always fed by the same source and the same grid component.'
  - 'Also several WordPress sites, from theme to deployment.'
couverture:
  src: '/medias/projets/sites-agence.webp'
  alt: 'Abstract artwork standing in for the agency websites'
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: 'These sites belong to their clients and several are not yet live. The banner is a montage of excerpts that does not identify any single client.'
---

Part of my paid work is building sites for an agency's clients: institutional
organisations, professionals, community groups. Mostly rebuilds: an existing
site that has aged and needs redoing without losing its content.

## Content as typed data

On the Astro projects, I organise content into collections validated by Zod
schemas rather than pages written by hand. In practice, adding an event or a
partner means dropping in a Markdown file, and a forgotten field stops the
build with a message naming it.

The client can touch the content without risking the layout, and I don't have
to review every edit.

## A foundation, not a framework

I work without Tailwind or any CSS framework. The foundation is a set of
tokens (generated colour ramps, a fluid type scale, computed spacing, declared
cascade layers) and a small library of mixins.

This portfolio is built on that foundation. The dark mode toggles at the top of
this page, and it required no theme-specific rule in any component: only one
layer of semantic tokens had to be redefined.

<!-- TODO Maxence: as soon as one of these sites is public, add it as its own
     project with screenshots and a link. A live site is worth ten paragraphs. -->
