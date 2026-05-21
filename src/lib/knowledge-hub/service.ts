/** Implementation archived — DB via pranidoctor-backend. */
export type ContentPostPublicPayload = any;
export type TutorialAuthorPublic = any;

export function displayNameForTutorialAuthor(u: TutorialAuthorPublic): string | null {
  return u?.doctorProfile?.displayName ?? u?.adminProfile?.displayName ?? null;
}
