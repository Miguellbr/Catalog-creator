import { createGenericSource, navigateToGame } from "../crawler/generic.js";
import { parseGamePage } from "../parser/heuristic.js";

export function createSourceAdapter(options = {}) {
  const source = createGenericSource(options);
  return {
    name: source.name,
    search: query => source.search(query),
    isIndexPage: page => source.isIndexPage(page),
    findGamePage: (page, game) => navigateToGame(page, game, options.maxNavigationDepth || 3),
    parseGamePage: page => parseGamePage(page)
  };
}
