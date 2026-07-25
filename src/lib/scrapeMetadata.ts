import "server-only";

export interface PageMetadata {
  title: string;
  description: string;
}

const FETCH_TIMEOUT_MS = 8000;

// Basic SSRF guard: this only needs to stop the common accidental/obvious
// cases (localhost, private ranges, the cloud metadata IP) since this is a
// single-user tool where the URL always comes from the user pasting their
// own project link, not a multi-tenant service exposed to hostile input.
const PRIVATE_HOSTNAME_PATTERN =
  /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|::1)$/i;

export function assertPublicHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("That doesn't look like a valid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http/https links are supported");
  }
  if (PRIVATE_HOSTNAME_PATTERN.test(url.hostname)) {
    throw new Error("That URL isn't reachable");
  }
  return url;
}

function extractMetaContent(html: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

export async function fetchPageMetadata(rawUrl: string): Promise<PageMetadata> {
  const url = assertPublicHttpUrl(rawUrl);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AiResumeBuilderBot/1.0; +https://example.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Couldn't fetch that link (HTTP ${response.status})`);
  }
  const html = await response.text();

  const title = extractMetaContent(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);
  const description = extractMetaContent(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);

  if (!title && !description) {
    throw new Error("Couldn't read a title or description from that page");
  }
  return { title, description };
}
