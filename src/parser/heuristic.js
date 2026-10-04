import { extractLinks, clean } from "./html.js";

const CUSA = /\bCUSA\d{5}\b/i;
const VERSION = /(?:\bupdate\s*|\bversion\s*|\bv)\s*(\d+(?:\.\d+){0,3})\b/i;
const REGION = /(?:-|\(|\[|\s)(EUR|USA|US|JPN|JAP|ASIA|CHN|KOR|UK|RUS)(?:\b|\)|\])/i;

export function parseGamePage(page) {
  const html = page?.html ?? "";
  const text = page?.text ?? clean(html);
  const blocks = splitBlocks(html);
  const parsed = blocks.length
    ? blocks.map((block, i) => parseBlock(block, page.url, i)).filter(Boolean)
    : [parseLoose(html, text, page.url)].filter(Boolean);

  const versions = mergeDuplicateEntries(parsed);

  if (!versions.length) return null;

  return {
    title: inferTitle(page.title, versions),
    versions
  };
}

function splitBlocks(html) {
  const positions = [];
  const re = /\bCUSA\d{5}\b/gi;
  let m;
  while ((m = re.exec(html))) positions.push(m.index);
  return positions.map((start, i) => html.slice(start, positions[i + 1] ?? html.length));
}

function parseBlock(block, baseUrl, position) {
  const text = clean(block);
  const cusa = (text.match(CUSA) || [null])[0];
  if (!cusa) return null;

  const regionMatch = text.match(REGION);
  const links = extractLinks(block, baseUrl);
  const version = getVersion(text);
  const game = [];
  const updates = [];
  const dlc = [];

  for (const link of links) {
    const label = (link.text + " " + link.title).trim();
    const lower = label.toLowerCase();

    if (/\bdlc\b|downloadable content/.test(lower)) {
      dlc.push(link);
    } else if (/\bupdate\b|\bpatch\b|\bfix\b/.test(lower)) {
      updates.push({ ...link, version: getVersion(label) || version });
    } else if (/\bgame\b|\bfull game\b|\bbase game\b/.test(lower)) {
      game.push(link);
    }
  }

  return {
    cusa: cusa.toUpperCase(),
    region: normalizeRegion(regionMatch?.[1]),
    mirror: /\bmirror\b/i.test(text),
    version,
    game,
    updates,
    dlc,
    sourcePosition: position
  };
}

function parseLoose(html, text, baseUrl) {
  const links = extractLinks(html, baseUrl);
  const game = [], updates = [], dlc = [];

  for (const link of links) {
    const label = (link.text + " " + link.title).trim();
    const lower = label.toLowerCase();
    if (/\bdlc\b/.test(lower)) dlc.push(link);
    else if (/\bupdate\b|\bpatch\b|\bfix\b/.test(lower)) updates.push({ ...link, version: getVersion(label) });
    else if (/\bgame\b|\bfull game\b|\bbase game\b/.test(lower)) game.push(link);
  }

  if (!game.length && !updates.length && !dlc.length) return null;

  return {
    cusa: (text.match(CUSA) || [null])[0]?.toUpperCase() ?? null,
    region: normalizeRegion((text.match(REGION) || [null, null])[1]),
    mirror: /\bmirror\b/i.test(text),
    version: getVersion(text),
    game,
    updates,
    dlc,
    sourcePosition: 0
  };
}

function getVersion(value) {
  const m = String(value).match(VERSION);
  return m ? m[1] : null;
}

function mergeDuplicateEntries(entries) {
  const merged = new Map();

  for (const entry of entries) {
    const key = entry.cusa || `unknown-${entry.sourcePosition}`;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...entry });
      continue;
    }

    if (!existing.region && entry.region) existing.region = entry.region;
    existing.mirror ||= entry.mirror;
    if (!existing.version && entry.version) existing.version = entry.version;

    existing.game = mergeLinks(existing.game, entry.game);
    existing.updates = mergeLinks(existing.updates, entry.updates);
    existing.dlc = mergeLinks(existing.dlc, entry.dlc);
  }

  return [...merged.values()];
}

function mergeLinks(left = [], right = []) {
  const result = [...left];
  const seen = new Set(result.map(link => `${link.href}|${link.text}|${link.version || ""}`));

  for (const link of right) {
    const key = `${link.href}|${link.text}|${link.version || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(link);
    }
  }

  return result;
}

function normalizeRegion(value) {
  if (!value) return null;
  const map = { US: "USA", JAP: "JPN" };
  return map[String(value).toUpperCase()] || String(value).toUpperCase();
}

function inferTitle(title, versions) {
  const value = String(title || "").replace(/\s+/g, " ").trim();
  if (value) return value.replace(/\s*[|–-].*$/, "").trim();
  return versions[0]?.cusa || "Unknown game";
}
