import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

async function getUserIdFromAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !SUPABASE_URL) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: auth },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.id || null;
  } catch (e) {
    console.warn("Failed to validate supabase token:", e);
    return null;
  }
}

function ensureSupabaseConfigured() {
  if (!SUPABASE_URL) {
    return NextResponse.json(
      { error: "SUPABASE_URL is not set — favorites require Supabase configuration (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)." },
      { status: 500 }
    );
  }
  return null;
}

// GET returns list of recipeIds favorited by the current user
export async function GET(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const favs = await prisma.favorite.findMany({ where: { userId }, select: { recipeId: true, createdAt: true } });
    return NextResponse.json({ favorites: favs });
  } catch (e) {
    console.error("/api/user/favorites GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST { recipeId: number } — creates a favorite
export async function POST(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { recipeId } = body;
    if (!recipeId || typeof recipeId !== "number") {
      return NextResponse.json({ error: "recipeId must be a number" }, { status: 400 });
    }

    // upsert favorite (do nothing if exists)
    const existing = await prisma.favorite.findUnique({ where: { userId_recipeId: { userId, recipeId } } }).catch(() => null);
    if (existing) return NextResponse.json({ success: true, favorite: existing });

    const created = await prisma.favorite.create({ data: { userId, recipeId } });
    return NextResponse.json({ success: true, favorite: created });
  } catch (e) {
    console.error("/api/user/favorites POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE { recipeId: number } — remove favorite
export async function DELETE(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { recipeId } = body;
    if (!recipeId || typeof recipeId !== "number") {
      return NextResponse.json({ error: "recipeId must be a number" }, { status: 400 });
    }

    await prisma.favorite.deleteMany({ where: { userId, recipeId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("/api/user/favorites DELETE error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
