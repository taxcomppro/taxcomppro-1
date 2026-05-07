import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// POST /api/pro-hub/[slug]/sync-irs
// Admin only — fetches IRS newsroom and creates ForumPost for each new item
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string; id: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const forum = await prisma.forum.findUnique({ where: { slug } });
  if (!forum) return NextResponse.json({ error: "Forum not found" }, { status: 404 });

  // Fetch IRS newsroom
  let html = "";
  try {
    const res = await fetch("https://www.irs.gov/newsroom", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (res.ok) html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch IRS news", detail: String(e) }, { status: 502 });
  }

  if (!html) return NextResponse.json({ error: "Empty response from IRS" }, { status: 502 });

  function stripHtml(s: string) {
    return s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, "").replace(/\s+/g, " ").trim();
  }

  interface IrsItem { title: string; link: string; irNumber: string; pubDate: string; description: string }
  const items: IrsItem[] = [];

  // Parse views-row structure (confirmed from IRS Drupal HTML)
  const rowRe = /<div class="views-row">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(html)) !== null && items.length < 20) {
    const chunk = rowMatch[1];
    const linkMatch = chunk.match(/<a\s+href="(\/newsroom\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href  = linkMatch[1];
    const title = stripHtml(linkMatch[2]);
    if (!title || title.length < 10) continue;

    const descMatch = chunk.match(/views-field-pup-description-abstract[\s\S]*?<div class="field-content">([\s\S]*?)<\/div>/i);
    const rawDesc   = descMatch ? stripHtml(descMatch[1]) : "";

    const irMatch  = rawDesc.match(/^(IR-\d{4}-\d+)\s+/i);
    const irNumber = irMatch?.[1] ?? "";
    const dateMatch = rawDesc.match(/IR-\d{4}-\d+\s+([A-Z][a-z]+ \d+, \d{4})/);
    const pubDate   = dateMatch?.[1] ?? "";
    const dashIdx   = rawDesc.indexOf(" - ");
    const description = dashIdx > -1 ? rawDesc.slice(dashIdx + 3).trim().slice(0, 500) : rawDesc.slice(0, 500);

    items.push({ title, link: `https://www.irs.gov${href}`, irNumber, pubDate, description });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "No IRS items parsed — HTML structure may have changed", created: 0 }, { status: 200 });
  }

  // Create ForumPosts for items that don't already exist (deduplicate by title)
  let created = 0;
  for (const item of items) {
    const existing = await prisma.forumPost.findFirst({
      where: { forumId: forum.id, title: item.title },
    });
    if (existing) continue;

    // Build the body with IR number, date, description and source link
    const body = [
      item.irNumber ? `**${item.irNumber}** — ${item.pubDate}` : item.pubDate,
      "",
      item.description || "See full article on IRS.gov",
      "",
      `🔗 [Read full article on IRS.gov](${item.link})`,
    ].filter(Boolean).join("\n");

    await prisma.forumPost.create({
      data: {
        forumId:  forum.id,
        authorId: user.id,
        title:    item.title,
        body,
        votes:    0,
        isPinned: false,
      },
    });
    created++;
  }

  return NextResponse.json({ ok: true, created, total: items.length });
}
