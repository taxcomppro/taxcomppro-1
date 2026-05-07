import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface IrsItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  irNumber: string;
}

let memCache: { data: IrsItem[]; ts: number } | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchIrsNews(): Promise<IrsItem[]> {
  const res = await fetch("https://www.irs.gov/newsroom", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const items: IrsItem[] = [];

  // IRS uses Drupal views — each item is wrapped in <div class="views-row">
  // Structure:
  //   <div class="views-row">
  //     <div class="views-field views-field-title">
  //       <h3 class="field-content"><a href="/newsroom/SLUG">TITLE</a></h3>
  //     </div>
  //     <div class="views-field views-field-field-pup-description-abstract">
  //       <div class="field-content">IR-2026-60 May 1, 2026 - Description...</div>
  //     </div>
  //   </div>

  const rowRe = /<div class="views-row">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(html)) !== null && items.length < 12) {
    const chunk = rowMatch[1];

    // Extract href and title from anchor inside views-field-title
    const linkMatch = chunk.match(/<a\s+href="(\/newsroom\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href  = linkMatch[1];
    const title = stripHtml(linkMatch[2]);
    if (!title || title.length < 10) continue;

    // Extract description/abstract block
    const descMatch = chunk.match(/views-field-pup-description-abstract[\s\S]*?<div class="field-content">([\s\S]*?)<\/div>/i);
    const rawDesc = descMatch ? stripHtml(descMatch[1]) : "";

    // The abstract contains "IR-YYYY-NN Month Day, YEAR - actual description"
    // Parse out the IR number, date, and description
    const irMatch  = rawDesc.match(/^(IR-\d{4}-\d+)\s+/i);
    const irNumber = irMatch ? irMatch[1] : "";

    // Date is right after the IR number: "May 1, 2026"
    const dateMatch = rawDesc.match(/IR-\d{4}-\d+\s+([A-Z][a-z]+ \d+, \d{4})/);
    const pubDate   = dateMatch ? dateMatch[1] : "";

    // Description is after " - "
    const dashIdx   = rawDesc.indexOf(" - ");
    const description = dashIdx > -1 ? rawDesc.slice(dashIdx + 3).trim().slice(0, 250) : "";

    items.push({
      id:   href,
      title,
      link: `https://www.irs.gov${href}`,
      description,
      pubDate,
      irNumber,
    });
  }

  // Fallback: if views-row regex didn't match (HTML minified), try simpler anchor approach
  if (items.length === 0) {
    const anchorRe = /<a\s+href="(\/newsroom\/[^"?#"]{20,})"[^>]*hreflang="en"[^>]*>([\s\S]{15,200}?)<\/a>/g;
    let m: RegExpExecArray | null;
    const seen = new Set<string>();

    while ((m = anchorRe.exec(html)) !== null && items.length < 12) {
      const href  = m[1];
      const title = stripHtml(m[2]);
      if (!title || seen.has(href) || href.includes("/forms/") || href.includes("/publications/")) continue;
      seen.add(href);

      // Grab ~600 chars after the match to find the abstract
      const after    = html.slice(m.index + m[0].length, m.index + m[0].length + 600);
      const irMatch  = after.match(/(IR-\d{4}-\d+)/);
      const dateMatch = after.match(/([A-Z][a-z]+ \d+, \d{4})/);
      const dashIdx   = after.indexOf(" - ");

      items.push({
        id:          href,
        title,
        link:        `https://www.irs.gov${href}`,
        description: dashIdx > -1 ? stripHtml(after.slice(dashIdx + 3)).slice(0, 250) : "",
        pubDate:     dateMatch?.[1] ?? "",
        irNumber:    irMatch?.[1] ?? "",
      });
    }
  }

  return items;
}

export async function GET() {
  // Return stale cache immediately if fresh enough
  if (memCache && Date.now() - memCache.ts < CACHE_MS) {
    return NextResponse.json(memCache.data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  }

  try {
    const data = await fetchIrsNews();

    if (data.length > 0) {
      memCache = { data, ts: Date.now() };
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("[/api/irs-news]", err);
    // Return stale cache on error
    if (memCache) return NextResponse.json(memCache.data);
    return NextResponse.json([], { status: 200 });
  }
}
