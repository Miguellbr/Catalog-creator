export async function fetchPage(url, options = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": options.userAgent ?? "Catalog-Creator/0.2",
      "accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) throw new Error(`HTTP_${response.status}: ${url}`);

  const html = await response.text();
  return {
    url: response.url,
    html,
    title: extractTitle(html),
    text: htmlToText(html)
  };
}

export function htmlToText(html = "") {
  return decodeEntities(String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ").trim());
}

export function extractTitle(html = "") {
  const match = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).replace(/\s+/g, " ").trim() : "";
}

export function decodeEntities(value = "") {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}
