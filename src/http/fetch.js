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

  if (process.env.CATALOG_DEBUG === "1") {
    const markers = {
      loginUrl: /wp-login\.php/i.test(response.url),
      loginForm: /<form[^>]+(?:login|log-in)[^>]*>|<input[^>]+(?:name|id)=["'](?:log|user_login)["']/i.test(html),
      accessDenied: /access denied/i.test(html),
      forbidden: /\bforbidden\b/i.test(html),
      cloudflare: /\bcloudflare\b/i.test(html),
      challenge: /cf-chl-|challenge-platform|checking your browser|just a moment/i.test(html),
      gameTitle: /god of war/i.test(html),
      cusa: /\bCUSA\d{5}\b/i.test(html)
    };

    const blockedReasons = [];
    if (markers.accessDenied) blockedReasons.push("access-denied");
    if (markers.forbidden) blockedReasons.push("forbidden");
    if (markers.challenge) blockedReasons.push("challenge");

    console.error(
      "[http-debug]",
      response.status,
      response.url,
      "bytes:",
      html.length,
      { ...markers, blocked: blockedReasons.length > 0, blockedReasons }
    );
  }

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
