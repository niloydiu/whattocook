import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/adminAuth";

function extractQParam(url: string) {
  try {
    const u = new URL(url);
    return u.searchParams.get("q") || null;
  } catch {
    return null;
  }
}

function unwrapLink(value: string | null) {
  if (!value) return value;
  // markdown [text](url)
  const md = value.match(/^\s*\[.*?\]\((.*?)\)\s*$/);
  if (md) return md[1];
  // html <a href="url"> or plain <url>
  const angle = value.match(/^\s*<(.+)>\s*$/);
  if (angle) return angle[1];
  // plain anchor tag
  const aTag = value.match(/href=["']([^"']+)["']/i);
  if (aTag) return aTag[1];
  return value.trim();
}

function extractYoutubeId(url: string | null) {
  if (!url) return null;
  // unwrap markdown/anchor wrappers first
  url = unwrapLink(url);

  // If it's a google search with q=youtube url
  const q = extractQParam(url);
  if (q && q.includes("youtube")) url = q;

  // common patterns
  const vMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (vMatch) return vMatch[1];
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = url.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const viMatch = url.match(/vi\/([A-Za-z0-9_-]{11})/);
  if (viMatch) return viMatch[1];
  return null;
}

function normalizeImageUrl(img: string | null) {
  if (!img) return null;
  // unwrap markdown or anchor wrappers
  img = unwrapLink(img);

  // If it's a google search link with q=actualImageUrl
  const q = extractQParam(img);
  if (q && (q.startsWith("http://") || q.startsWith("https://"))) {
    return q;
  }

  // If it's already an img.youtube.com URL, keep as-is
  if (img.includes("img.youtube.com/vi/")) return img;

  return img;
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  const { fix } = (await req.json().catch(() => ({}))) as { fix?: boolean };

  try {
    const recipes = await prisma.recipe.findMany();
    const report: any[] = [];

    for (const r of recipes) {
      const issues: string[] = [];
      const updates: any = {};

      // Normalize youtube_url
      const rawYoutube = r.youtube_url;
      const extracted = extractYoutubeId(rawYoutube);
      if (!rawYoutube || (!rawYoutube.includes("youtube.com") && !rawYoutube.includes("youtu.be"))) {
        // maybe google search link
        const q = extractQParam(rawYoutube || "");
        if (q && q.includes("youtube")) {
          issues.push("youtube_url is a google search link");
          const id = extractYoutubeId(q);
          if (id) updates.youtube_url = `https://www.youtube.com/watch?v=${id}`;
        }
      }

      // ensure youtube_id exists
      if (!r.youtube_id) {
        const id = extractYoutubeId(r.youtube_url) || extracted;
        if (id) updates.youtube_id = id;
      }

      // Normalize image
      const normalizedImage = normalizeImageUrl(r.image);
      if (normalizedImage && normalizedImage !== r.image) {
        issues.push("image url was a redirect/search link");
        updates.image = normalizedImage;
      }

      if (Object.keys(updates).length > 0) {
        if (fix) {
          await prisma.recipe.update({ where: { id: r.id }, data: updates });
          report.push({ id: r.id, slug: r.slug, fixed: true, changes: updates });
        } else {
          report.push({ id: r.id, slug: r.slug, fixed: false, changes: updates });
        }
      } else {
        report.push({ id: r.id, slug: r.slug, fixed: false, changes: null });
      }
    }

    return NextResponse.json({ ok: true, results: report });
  } catch (err: any) {
    console.error("Error checking recipes URLs:", err?.stack || err);
    return NextResponse.json({ error: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}
