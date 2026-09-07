# Polices auto-hébergées

Sous-ensembles latin et latin-ext uniquement, téléchargés depuis Google Fonts
puis servis par ce site. Voir `src/styles/_fonts.scss` pour les déclarations et
la raison du changement.

Les trois familles sont publiées sous **SIL Open Font License 1.1**, qui
autorise explicitement la redistribution et l'auto-hébergement. Le texte
complet de la licence est le même pour les trois :
<https://openfontlicense.org/open-font-license-official-text/>

| Police | Auteur | Source |
| --- | --- | --- |
| Bricolage Grotesque | Mathieu Triay | <https://fonts.google.com/specimen/Bricolage+Grotesque> |
| Inter | Rasmus Andersson | <https://fonts.google.com/specimen/Inter> |
| JetBrains Mono | JetBrains | <https://fonts.google.com/specimen/JetBrains+Mono> |

## Les remplacer ou en ajouter

Récupère la feuille depuis Google Fonts avec un agent utilisateur récent (sinon
elle renvoie du woff1), garde les blocs `latin` et `latin-ext`, télécharge les
woff2 ici et ajoute les déclarations dans `src/styles/_fonts.scss`.
