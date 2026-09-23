---
titre: "AI-augmented internal systems"
resume: 'Two distinct professional tools where a language model does part of the work: one proposes site edits as pull requests, the other processes inbound emails all the way through to entry in a third-party system.'
categorie: 'pro'
annee: '2025'
role: "Design and development of both systems: the shared-schema architecture and review loop for the content assistant; structured extraction, validation and deposit automation for the request-processing automation."
ordre: 20
vedette: true
technos:
  ['TypeScript', 'Zod', 'Astro', 'Cloudflare Workers', 'Python', 'Flask', 'Playwright', 'Claude API']
faits:
  - "On the content assistant, one schema per content type serves three purposes: compile-time validation, the input schema of the tool offered to the model, and server-side revalidation before writing. Malformed content cannot reach a file."
  - "The model never publishes directly there: it proposes. Each proposal becomes a pull request the client reviews before merging. The YAML emitter is hand-written so the diff only ever moves one line when one thing changed."
  - "On the request-processing automation, an inbound email is first extracted by the model in tool-use mode (a data structure, never free text), then run through hard validation rules and duplicate detection before being accepted."
  - "Entry into the third-party system is decoupled from receiving the email: it runs as a recurring job, driven by an automated browser, so the acknowledgement never depends on a slow operation or an unreachable external service."
  - "Deployed as a service on the client's own Windows server rather than managed hosting: a single process, to avoid duplicating the session held open in the third-party system, and absolute browser-profile paths, to survive a scheduled task that doesn't always start in the same directory."
couverture:
  src: '/medias/projets/systemes-ia.webp'
  alt: 'Neon 3D render of an AI prompt input bar, cursor waiting for text'
  position: '50% 50%'
videos: []
youtube: []
liens: []
mention: "Professional work on two distinct systems, for two different clients. Neither is public: the first remains under a confidentiality agreement, the second belongs to a client who has not authorised disclosure. What is described here is limited to architecture, with no product or client names."
---

I have worked on two quite different professional tools where a language
model handles part of the work. The first, referred to here as the
**content assistant**, lets a non-technical client change their site by
describing what they want in plain language rather than filling in forms.
The second, the **request-processing automation**, receives emails and
processes them through to entry in an external system.

## The content assistant: preventing invalid, not just producing text

Getting a model to write content is easy. Stopping it from writing
**invalid** content is the actual work, and it is architecture, not
prompting.

The answer here comes down to one constraint: a single schema per content
type, serving three purposes at once. Astro validates against it at build
time. It becomes the input schema of the tool offered to the model, so the
model cannot produce a shape it doesn't know. And the server revalidates
against it before writing the file. Since the only path to a file crosses
that schema, malformed content cannot reach the site.

The model publishes nothing: it proposes, and its proposal becomes a pull
request the client reviews before merging. That review is only worth
anything if the diff is readable, hence a hand-written YAML emitter rather
than one from a library: stable key order, quote style and indentation
guarantee that one line moves when one thing changed.

## The request-processing automation: extract, validate, then act

This system receives an email, has the model extract the essentials — in
tool-use mode, so a defined data structure rather than free text — then
runs that extraction through hard validation rules and duplicate detection
before accepting the request.

The part that touches the external system is deliberately decoupled from
the rest: it doesn't fire on receipt of the email, but as a recurring job,
and goes through an automated browser rather than an API. That separation
has two effects. It keeps an operation lasting tens of seconds from timing
out the request that delivered the email. And it makes the system tolerant:
if the external service is unreachable, requests queue up and go through on
their own once it responds again.

Deployment imposed its own constraints. The service runs on the client's
own Windows server, not on managed hosting: a single process, so as not to
open two concurrent sessions in the external system, and absolute
browser-profile paths, to survive a scheduled task that doesn't always
start in the same working directory.
