---
titre: 'AI-augmented internal systems'
resume: 'Several internal tools where a language model does part of the work, under an architecture that makes it structurally unable to produce anything invalid.'
categorie: 'pro'
annee: '2025'
role: 'Design and development. On the content manager, the shared-schema architecture and the review loop.'
ordre: 20
vedette: true
technos: ['TypeScript', 'Zod', 'Astro', 'Cloudflare Workers', 'Claude API']
faits:
  - 'One schema per content type, used in three places: compile-time validation, the input schema of the tool offered to the model, and server-side revalidation before writing. Malformed content cannot reach a file.'
  - 'The model never publishes directly: it proposes. Each proposal becomes a pull request the client reviews before merging.'
  - 'To keep those diffs readable, the YAML emitter is hand-written rather than taken from a library: stable key order, quote style and indentation guarantee that one line moves when one thing changed.'
  - 'The writable area is restricted by a path allowlist, with a per-folder catalogue of permitted formats.'
couverture:
  src: '/medias/projets/systemes-ia.webp'
  alt: 'Abstract artwork standing in for the AI-augmented internal systems'
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: 'Professional work. These systems are not public: one is still in development, the others are covered by a confidentiality agreement. What is described here is limited to architecture, with no product or client names.'
---

I have worked on more than one internal tool where a language model handles
part of the work. The most developed is a **content manager** that lets a
non-technical client change their site by describing what they want in plain
language, rather than by filling in forms.

## The real problem isn't the model

Getting a model to write content is easy. Stopping it from writing **invalid**
content is the actual work, and it is architecture, not prompting.

The answer here comes down to one constraint: a single schema per content type,
serving three purposes at once. Astro validates against it at build time. It
becomes the input schema of the tool offered to the model, so the model cannot
produce a shape it doesn't know. And the server revalidates against it before
writing the file. Since the only path to a file crosses that schema, malformed
content cannot reach the site.

## The client stays in control

The model publishes nothing. It proposes, and its proposal becomes a pull
request the client reviews before merging. That changes what the tool is: it
isn't an AI that manages the site, it's an AI that drafts suggestions a human
accepts or rejects.

That review is only worth anything if the diff is readable. Which is why the
YAML emitter is hand-written instead of taken from a library: stable key order,
quote style and indentation mean one line moves in the diff when one thing
changed. A generic emitter reorders keys.
