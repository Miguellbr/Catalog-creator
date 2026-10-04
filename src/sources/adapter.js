import { createGenericSource } from "../crawler/generic.js";
import { parseGamePage } from "../parser/heuristic.js";

export function createSourceAdapter(options = {}) {
  const source = createGenericSource(options);
  return {
    name: source.name,
    search: query => source.search(query),
    isIndexPage: page => source.isIndexPage(page),
    findGamePage: (page, game) => source.findGamePage(page, game),
    parseGamePage: page => parseGamePage(page)
  };
}
