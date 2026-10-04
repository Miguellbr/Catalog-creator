import { buildCatalog } from "./index.js";
import { createSourceAdapter } from "./sources/adapter.js";
import { sourceConfig } from "./config/source.js";

const queries = process.argv.slice(2);

if (!queries.length) {
  console.error('Use: node src/run.js "Nome do jogo"');
  process.exit(1);
}

const source = createSourceAdapter(sourceConfig);
const catalog = await buildCatalog({ source, queries });
console.log(JSON.stringify(catalog, null, 2));
