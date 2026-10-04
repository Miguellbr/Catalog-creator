import { decodeEntities } from "../http/fetch.js";

export function extractLinks(html = "", baseUrl = "") {
  const links = [];
  const re = /<a\b([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = `${m[1]} ${m[3]}`;
    const href = toAbsoluteUrl(m[2], baseUrl);
    if (!href) continue;
    links.push({ href, text: clean(m[4]), title: clean(readAttr(attrs, "title")) });
  }
  return links;
}

export function extractForms(html = "", baseUrl = "") {
  const forms = [];
  const re = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const input = m[2].match(/<input\b([^>]*)>/i);
    if (!input) continue;
    const name = readAttr(input[1], "name") || readAttr(input[1], "id");
    const type = (readAttr(input[1], "type") || "text").toLowerCase();
    const action = toAbsoluteUrl(readAttr(attrs, "action") || baseUrl, baseUrl);
    if (name && action && type !== "hidden") {
      forms.push({ action, method: (readAttr(attrs, "method") || "get").toLowerCase(), name });
    }
  }
  return forms;
}

export function readAttr(attrs = "", name) {
  const re = new RegExp("\b" + name + "\s*=\s*[\\\"']([^\\\"']*)[\\\"']", "i");
  const m = String(attrs).match(re);
  return m ? decodeEntities(m[1]) : "";
}

export function clean(value = "") {
  return decodeEntities(String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function toAbsoluteUrl(value, baseUrl) {
  try {
    if (!value || /^(javascript:|mailto:|#)/i.test(value)) return null;
    return new URL(value, baseUrl || undefined).href;
  } catch {
    return null;
  }
}
