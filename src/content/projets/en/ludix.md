---
titre: 'Ludix'
resume: 'A video game store as two clients — an Android app and a web back office — served by a single REST API.'
categorie: 'etudes'
annee: '2026'
role: 'Owned the interface and the design system, from the Figma mockup through to its implementation in both clients.'
ordre: 10
vedette: true
technos: ['Laravel', 'PHP', 'Android Studio', 'REST API', 'MySQL', 'Figma']
faits:
  - 'Two clients, one API: the Android app and the admin site consume the same REST endpoints, which forced us to settle the data contracts before writing any screens.'
  - 'An authenticated back office where administrators manage products, comments, events and user accounts.'
  - 'I built the reusable component library in Figma, then ported it twice: as Blade components on the Laravel side, as layouts and views on the Android side.'
  - 'A team of four. A significant share of my time went to unblocking teammates in their own code, which mostly taught me that a design system is worthless if the team cannot use it.'
couverture:
  src: '/medias/projets/ludix.webp'
  alt: 'Abstract artwork standing in for the Ludix project'
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: 'Academic team project at Cégep de Sherbrooke. The repository is not public.'
---

Ludix is a fictional video game store, built as a complete system rather than
a single deliverable: a mobile app for customers, an admin site for the store,
and a REST API between them.

## What targeting two clients changed

Writing two clients against one API imposes a discipline a single-client
project never asks for. Rename a field on the Laravel side and the Android app
breaks, and the reverse holds too. So we froze the data contracts before
designing any screens, which turned out to be the most profitable decision of
the project.

## The design system

I started in Figma: a component library — buttons, product cards, form fields,
loading states — with their variants. Then I implemented it twice, as Blade
components on the web and as reusable views on Android.

Porting the same system into two technologies teaches you quickly which parts
of a mockup are principles and which are details. A colour or a spacing value
transposes without thinking; a hover state does not — it doesn't exist on
mobile, and you have to decide what replaces it.

<!-- TODO Maxence: this project would gain enormously from screenshots. Two
     would do: one Android screen and one back-office view. Drop them in
     public/medias/projets/ and fill in `couverture` above. A card without an
     image is the one people look at least. -->
