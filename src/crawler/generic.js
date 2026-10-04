import { fetchPage } from "../http/fetch.js";
import { extractForms, extractLinks } from "../parser/html.js";

const DEBUG = process.env.CATALOG_DEBUG === "1";

function debug(...args) {
  if (DEBUG) console.error("[catalog-debug]", ...args);
}

export function createGenericSource(options = {}) {
  const source = {
    name: options.name || "Generic source",
    baseUrl: options.baseUrl || "",
    searchTemplates: options.searchTemplates || [],
    platform: options.platform || null,
    maxNavigationDepth: options.maxNavigationDepth || 3,

    async search(query) {
      debug("query:", query);
      for (const template of source.searchTemplates) {
        const url = expandTemplate(template, query);
        debug("template:", template, "=>", url);
        const page = await tryFetch(template, query);
        if (page) {
          debug("page found:", page.url, "title:", page.title, "html:", page.html.length);
          return [page];
        }
        debug("template failed:", url);
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
      return navigateToGame(page, game, source.maxNavigationDepth, source.platform);
    }
  };

  return source;
}

export async function navigateToGame(page, game, maxDepth = 3, platform = null) {
  let current = page;
  const visited = new Set();

  for (let depth = 0; depth < maxDepth; depth++) {
    const cusaMatches = [...new Set((current.html || "").match(/\bCUSA\d{5}\b/gi) || [])];
    if (DEBUG) console.error("[cusa-debug]", current.url, "matches:", cusaMatches, "textHasCUSA:", /\bCUSA\d{5}\b/i.test(current.text || ""), "platformMatch:", isPlatformMatch(current, platform));

    if (/\bCUSA\d{5}\b/i.test(current.text || "") && isPlatformMatch(current, platform)) {
      debug("CUSA found at depth", depth, current.url);
      return current;
    }

    const links = extractLinks(current.html || "", current.url)
      .map(link => ({ ...link, score: scoreLink(link, game, platform) }))
      .filter(link => link.score > 0 && !visited.has(link.href))
      .sort((a, b) => b.score - a.score);

    visited.add(current.url);
    debug("depth", depth, "candidate links:", links.slice(0, 5).map(link => ({ text: link.text, href: link.href, score: link.score })));
    if (!links.length) return null;

    const relevantLinks = wantedGameLinks(links, game);
    if (!relevantLinks.length) {
      debug("no game-specific candidates at depth", depth);
      return null;
    }

    let next = null;
    for (const link of relevantLinks.slice(0, 5)) {
      try {
        const candidate = await fetchPage(link.href);
        if (candidate.html) {
          next = candidate;
          break;
        }
      } catch {}
    }

    if (!next) {
      debug("no candidate page fetched at depth", depth);
      return null;
    }
    debug("following:", next.url, "title:", next.title);
    current = next;
  }

  const cusaMatches = [...new Set((current.html || "").match(/\bCUSA\d{5}\b/gi) || [])];
  if (DEBUG) console.error("[cusa-debug]", current.url, "final matches:", cusaMatches, "textHasCUSA:", /\bCUSA\d{5}\b/i.test(current.text || ""), "platformMatch:", isPlatformMatch(current, platform));
  return /\bCUSA\d{5}\b/i.test(current.text || "") && isPlatformMatch(current, platform) ? current : null;
}

export function scoreLink(link, game, platform = null) {
  const target = (link.text + " " + link.title + " " + link.href).toLowerCase();
  const wanted = String(game || "").toLowerCase().trim();
  if (!target) return 0;

  let score = 0;
  if (wanted && target.includes(wanted)) score += 10;

  for (const word of wanted.split(/\s+/).filter(w => w.length > 2)) {
    if (target.includes(word)) score += 2;
  }

  if (/\b(game|download|details|read more|view)\b/.test(target)) score += 2;
  if (/\b(tag|category|search|author|comment|login)\b/.test(link.href.toLowerCase())) score -= 6;
  if (/^https?:\/\/(www\.)?x\.com\//i.test(link.href)) score -= 20;
  if (/\b(list-all|list-game|archive)\b/.test(target)) score -= 8;

  if (platform) {
    const wantedPlatform = String(platform).toLowerCase();
    if (target.includes(wantedPlatform)) score += 8;
    if (/\bps5\b|\bps3\b|\bps2\b|\bps1\b|\bpsvita\b/.test(target) && !target.includes(wantedPlatform)) score -= 12;
    if (platform === "ps4") {
      const path = new URL(link.href).pathname.toLowerCase();
      if (/\bps5\b|\bps3\b|\bps2\b|\bps1\b|\bpsvita\b/.test(path) && !/\bps4\b/.test(path)) score -= 30;
    }
  }

  return score;
}

function wantedGameLinks(links, game) {
  const wanted = String(game || "").toLowerCase().trim();
  if (!wanted) return links;

  const words = wanted.split(/\\s+/).filter(word => word.length > 2);
  return links.filter(link => {
    const target = (link.text + " " + link.title + " " + link.href).toLowerCase();
    return target.includes(wanted) || words.every(word => target.includes(word));
  });
}

function isListing(page) {
  const url = String(page?.url || "").toLowerCase();
  const title = String(page?.title || "").toLowerCase();
  return /\b(tag|category|search|archive|page)\b/.test(url) ||
    /\b(search results|category|tag)\b/.test(title);
}

async function tryFetch(template, query) {
  const url = expandTemplate(template, query);
  try {
    return await fetchPage(url);
  } catch (error) {
    debug("fetch error:", url, error?.message || String(error));
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

function isPlatformMatch(page, platform) {
  if (!platform) return true;

  const wanted = String(platform).toLowerCase();
  const url = String(page?.url || "").toLowerCase();
  const title = String(page?.title || "").toLowerCase();
  const text = String(page?.text || "").toLowerCase();

  if (wanted === "ps4") {
    if (/\bps5\b|\bps3\b|\bps2\b|\bps1\b|\bpsvita\b/.test(url) && !/\bps4\b/.test(url)) {
      return false;
    }
    if (/\bps4\b/.test(url)) return true;
  }

  const wantedRe = new RegExp("\\b" + String(wanted).replace(/[.*+?^$()|[\]\\]/g, "\\$&") + "\\b", "i");
  return wantedRe.test(url) || wantedRe.test(title) || wantedRe.test(text);
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
