import { fetchPage } from "../http/fetch.js";
import { extractForms, extractLinks } from "../parser/html.js";

export function createGenericSource(options = {}) {
  const source = {
    name: options.name || "Generic source",
    baseUrl: options.baseUrl || "",
    searchTemplates: options.searchTemplates || [],
    maxNavigationDepth: options.maxNavigationDepth || 3,

    async search(query) {
      for (const template of source.searchTemplates) {
        const page = await tryFetch(template, query);
        if (page) return [page];
      }

      if (!source.baseUrl) return [];

      try {
        const home = await fetchPage(source.baseUrl);
        const forms = extractForms(home.html, home.url).filter(f => f.method === "get");

        for (const form of forms) {
          try {
            const url = new URL(form.action);
            url.searchParams.set(form.name, query);
            const page = await fetchPage(url.href);
            if (page.html) return [page];
          } catch {}
        }

        const common = [
          source.baseUrl.replace(/\/$/, "") + "/?s={query}",
          source.baseUrl.replace(/\/$/, "") + "/search/{query}/",
          source.baseUrl.replace(/\/$/, "") + "/?search={query}"
        ];

        for (const template of common) {
          const page = await tryFetch(template, query);
          if (page) return [page];
        }
      } catch {}

      return [];
    },

    isIndexPage(page) {
      const text = page?.text || "";
      const links = extractLinks(page?.html || "", page?.url);
      if (/\bCUSA\d{5}\b/i.test(text)) return false;
      return isListing(page) || links.some(link => scoreLink(link, "") >= 4);
    },

    async findGamePage(page, game) {
      return navigateToGame(page, game, source.maxNavigationDepth);
    }
  };

  return source;
}

export async function navigateToGame(page, game, maxDepth = 3) {
  let current = page;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (/\bCUSA\d{5}\b/i.test(current.text || "")) return current;

    const links = extractLinks(current.html || "", current.url)
      .map(link => ({ ...link, score: scoreLink(link, game) }))
      .filter(link => link.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!links.length) return null;

    let next = null;
    for (const link of links.slice(0, 5)) {
      try {
        const candidate = await fetchPage(link.href);
        if (candidate.html) {
          next = candidate;
          break;
        }
      } catch {}
    }

    if (!next) return null;
    current = next;
  }

  return /\bCUSA\d{5}\b/i.test(current.text || "") ? current : null;
}

export function scoreLink(link, game) {
  const target = (link.text + " " + link.title + " " + link.href).toLowerCase();
  const wanted = String(game || "").toLowerCase().trim();
  if (!target) return 0;

  let score = 0;
  if (wanted && target.includes(wanted)) score += 10;

  for (const word of wanted.split(/\s+/).filter(w => w.length > 2)) {
    if (target.includes(word)) score += 2;
  }

  if (/\b(game|download|details|read more|view)\b/.test(target)) score += 2;
  if (/\b(tag|category|search|author|comment)\b/.test(link.href.toLowerCase())) score -= 2;

  return score;
}

function isListing(page) {
  const url = String(page?.url || "").toLowerCase();
  const title = String(page?.title || "").toLowerCase();
  return /\b(tag|category|search|archive|page)\b/.test(url) ||
    /\b(search results|category|tag)\b/.test(title);
}

async function tryFetch(template, query) {
  try {
    return await fetchPage(expandTemplate(template, query));
  } catch {
    return null;
  }
}

export function expandTemplate(template, game) {
  const value = String(game ?? "").trim();
  const encoded = encodeURIComponent(value);
  const slug = slugify(value);

  return String(template)
    .replaceAll("{GAME_SLUG}", slug)
    .replaceAll("{GAME}", encoded)
    .replaceAll("{QUERY}", encoded)
    .replaceAll("{query}", encoded);
}

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
