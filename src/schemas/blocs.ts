// Un bloc de prose : un titre optionnel et un corps en Markdown.
//
// Sert aux textes qui contiennent des liens : la bio de l'accueil, le
// paragraphe « Au-delà du code », le mot sur le travail en agence. Le corps est
// rendu avec la classe `.prose`, qui lui donne son rythme vertical.
//
// Un bloc par langue : src/content/blocs/fr/<nom>.md et en/<nom>.md.
import { z } from 'astro/zod';

export const blocSchema = z.strictObject({
  // Optionnel : la plupart des blocs sont introduits par le titre de leur
  // section, et un second titre ferait doublon.
  titre: z.string().optional(),
});

export type Bloc = z.infer<typeof blocSchema>;
