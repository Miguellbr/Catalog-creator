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
  baseUrl: "https://dlpsgame.com",
  platform: "PS4",

  // Example:
  // searchTemplates: ["https://example.com/tag/{GAME_SLUG}/"],
  searchTemplates: [

    "https://dlpsgame.com/tag/{GAME_SLUG}/"
  ],

  maxNavigationDepth: 3
};
