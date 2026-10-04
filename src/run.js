import fs from "node:fs/promises";
import { buildCatalog } from "./index.js";
import { createSourceAdapter } from "./sources/adapter.js";
import { sourceConfig } from "./config/source.js";

async function readQueries() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf("--file");

  if (fileIndex !== -1) {
    const file = args[fileIndex + 1];
    if (!file) throw new Error("Use --file com o caminho de um arquivo.");

    const content = await fs.readFile(file, "utf8");
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => !line.startsWith("#"));
  }

  return args.filter(arg => arg !== "--file");
}

const queries = await readQueries();

if (!queries.length) {
  console.error('Use: node src/run.js "Nome do jogo"');
  console.error("Ou:   node src/run.js --file games.txt");
  process.exit(1);
}

const source = createSourceAdapter(sourceConfig);
const catalog = await buildCatalog({ source, queries });
console.log(JSON.stringify(catalog, null, 2));
