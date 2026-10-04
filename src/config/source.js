/**
 * Describe the WEBSITE, not individual games.
 *
 * Template variables:
 *   {GAME_SLUG} -> "risk-of-rain-2"
 *   {GAME}      -> URL-encoded game name
 *   {QUERY}     -> URL-encoded game name
 *
 * Do not put individual game URLs or CUSA numbers here.
 */
export const sourceConfig = {
  name: "My Source",
  baseUrl: "https://superpsx.com",
  platform: "PS4",

  // Example:
  // searchTemplates: ["https://example.com/tag/{GAME_SLUG}/"],
  searchTemplates: [
  "https://www.superpsx.com/{GAME_SLUG}-ps4-pkg/",
  "https://www.superpsx.com/{GAME_SLUG}-ps4-fpkg/",
  "https://www.superpsx.com/dll-{GAME_SLUG}ps4/",
  "https://www.superpsx.com/term-{GAME_SLUG}ps4/"
]

  maxNavigationDepth: 3
};
