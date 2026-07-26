import "server-only";

export interface PageMetadata {
  title: string;
  description: string;
  category?: string;
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

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&nbsp;/g, (entity) => HTML_ENTITIES[entity]);
}

function extractMetaContent(html: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }
  return "";
}

/**
 * App store listings (Play Store, App Store) commonly embed schema.org
 * structured data for rich search results, which tends to hold a fuller
 * description than the truncated og:description meta tag, and a clean
 * "name" without the store's own title-tag boilerplate (e.g. Play Store's
 * <title> is "X - Apps on Google Play", but JSON-LD's "name" is just "X").
 */
function extractJsonLd(html: string): { name: string; description: string; category: string } {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    const jsonText = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    try {
      const parsed = JSON.parse(jsonText);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        const name = typeof candidate?.name === "string" ? candidate.name.trim() : "";
        const description = typeof candidate?.description === "string" ? candidate.description.trim() : "";
        const category = typeof candidate?.applicationCategory === "string" ? candidate.applicationCategory.trim() : "";
        if (name || description) return { name, description, category };
      }
    } catch {
      // Malformed/non-JSON-LD script block - ignore and keep looking.
    }
  }
  return { name: "", description: "", category: "" };
}

// Store/marketplace title tags commonly append boilerplate the JSON-LD
// "name" field doesn't have - strip it as a fallback for pages with no
// usable JSON-LD, so the AI isn't fed "X - Apps on Google Play" as the title.
const TITLE_SUFFIX_PATTERN = /\s*[-|]\s*(Apps on Google Play|on the App Store|App Store)\s*$/i;

function cleanTitle(title: string): string {
  return title.replace(TITLE_SUFFIX_PATTERN, "").trim();
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

  const rawTitle = extractMetaContent(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const ogDescription = extractMetaContent(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
  ]);
  const twitterDescription = extractMetaContent(html, [
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i,
  ]);
  const metaDescription = extractMetaContent(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);
  const jsonLd = extractJsonLd(html);
  const title = jsonLd.name || cleanTitle(rawTitle);

  // Structured data descriptions are usually the fullest, meta descriptions
  // the most reliably present but often truncated for SEO - gather every
  // distinct one found so the model has more than one short sentence to
  // work with, instead of picking just the first source that exists.
  const description = Array.from(
    new Set([jsonLd.description, ogDescription, twitterDescription, metaDescription].filter(Boolean))
  ).join("\n");

  if (!title && !description) {
    throw new Error("Couldn't read a title or description from that page");
  }
  return { title, description, category: jsonLd.category || undefined };
}
