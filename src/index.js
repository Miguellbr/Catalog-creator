import { normalizeGame } from "./catalog/normalize.js";

export async function buildCatalog({ source, queries = [] }) {
  const games = [];
  const seen = new Set();

  for (const query of queries) {
    const results = await source.search(query);
    for (const result of results || []) {
      const page = source.isIndexPage(result) ? await source.findGamePage(result, query) : result;
      if (!page || seen.has(page.url)) continue;
      seen.add(page.url);
      const game = source.parseGamePage(page);
      if (game) games.push(normalizeGame(game));
    }
  }

  return { generatedAt: new Date().toISOString(), games };
}
