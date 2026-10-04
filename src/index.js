import { normalizeGame } from "./catalog/normalize.js";

export async function buildCatalog({ source, queries = [] }) {
  const games = [];

  for (const query of queries) {
    const results = await source.search(query);

    for (const result of results ?? []) {
      let page = result;

      if (source.isIndexPage(page)) {
        page = await source.findGamePage(page, query);
      }

      if (!page) continue;

      const game = source.parseGamePage(page);
      if (game) games.push(normalizeGame(game));
    }
  }

  return { games };
}
