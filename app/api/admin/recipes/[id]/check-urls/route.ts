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
  const md = value.match(/^\s*\[.*?\]\((.*?)\)\s*$/);
  if (md) return md[1];
  const angle = value.match(/^\s*<(.+)>\s*$/);
  if (angle) return angle[1];
  const aTag = value.match(/href=["']([^"']+)["']/i);
  if (aTag) return aTag[1];
  return value.trim();
}

function extractYoutubeId(url: string | null) {
  if (!url) return null;
  url = unwrapLink(url);
  if (!url) return null;
  const q = extractQParam(url);
  if (q && q.includes("youtube")) url = q;

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
  img = unwrapLink(img);
  if (!img) return null;
  const q = extractQParam(img);
  if (q && (q.startsWith("http://") || q.startsWith("https://"))) {
    return q;
  }
  if (img.includes("img.youtube.com/vi/")) return img;
  return img;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(req)) return unauthorizedResponse();
    let id: number;
    const paramsObj = await ctx.params;
    const idStr = paramsObj?.id;
    if (idStr) {
      id = parseInt(idStr, 10);
    } else {
      // Fallback: extract id from request URL path
      try {
        let u: URL;
        try {
          u = new URL(req.url);
        } catch {
          u = new URL(req.url, "http://localhost");
        }
        const m = u.pathname.match(/\/api\/admin\/recipes\/(\d+)\/check-urls/);
        if (!m)
          return NextResponse.json(
            { error: "Missing recipe id" },
            { status: 400 }
          );
        id = parseInt(m[1], 10);
      } catch (e) {
        return NextResponse.json(
          { error: "Missing recipe id" },
          { status: 400 }
        );
      }
    }
    if (Number.isNaN(id))
      return NextResponse.json({ error: "Invalid recipe id" }, { status: 400 });

    const { fix } = (await req.json().catch(() => ({}))) as { fix?: boolean };

    const r = await prisma.recipe.findUnique({ where: { id } });
    if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updates: any = {};

    const rawYoutube = r.youtube_url;
    const q = extractQParam(rawYoutube || "");
    if (q && q.includes("youtube")) {
      const idFromQ = extractYoutubeId(q);
      if (idFromQ)
        updates.youtube_url = `https://www.youtube.com/watch?v=${idFromQ}`;
    }

    if (!r.youtube_id) {
      const idFound = extractYoutubeId(r.youtube_url);
      if (idFound) updates.youtube_id = idFound;
    }

    const normalizedImage = normalizeImageUrl(r.image);
    if (normalizedImage && normalizedImage !== r.image)
      updates.image = normalizedImage;

    if (Object.keys(updates).length > 0) {
      if (fix) {
        const updated = await prisma.recipe.update({
          where: { id },
          data: updates,
        });
        return NextResponse.json({ ok: true, fixed: true, recipe: updated });
      }
      return NextResponse.json({ ok: true, fixed: false, changes: updates });
    }

    return NextResponse.json({ ok: true, fixed: false, changes: null });
  } catch (err: any) {
    console.error("Error checking recipe url:", err?.stack || err);
    return NextResponse.json(
      { error: err?.message || String(err), stack: err?.stack },
      { status: 500 }
    );
  }
}
