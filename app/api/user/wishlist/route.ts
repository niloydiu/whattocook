import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

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
      {
        error:
          "SUPABASE_URL is not set — wishlist requires Supabase configuration (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).",
      },
      { status: 500 }
    );
  }
  return null;
}

// GET returns user's wishlist items
export async function GET(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const list = await prisma.wishlistIngredient.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ wishlist: list });
  } catch (e) {
    console.error("/api/user/wishlist GET error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST { ingredientId?: number, name_en?: string, name_bn?: string }
export async function POST(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ingredientId, name_en, name_bn } = body;
    if (!ingredientId && !name_en) {
      return NextResponse.json(
        { error: "ingredientId or name_en required" },
        { status: 400 }
      );
    }

    let resolvedIngredientId: number | null = null;

    if (ingredientId && typeof ingredientId === "number") {
      const ing = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });
      if (ing) resolvedIngredientId = ing.id;
    }

    if (!resolvedIngredientId && name_en) {
      const found = await prisma.ingredient.findFirst({
        where: {
          OR: [
            { name_en: { equals: name_en, mode: "insensitive" as const } },
            { name_bn: { equals: name_en } },
          ],
        },
      });
      if (found) resolvedIngredientId = found.id;
    }

    // Avoid duplicates: if user already has this ingredient (by ingredientId or name), return existing
    const existing = await prisma.wishlistIngredient.findFirst({
      where: resolvedIngredientId
        ? { userId, ingredientId: resolvedIngredientId }
        : { userId, name_en: name_en ?? undefined },
    });
    if (existing) return NextResponse.json({ success: true, item: existing });

    const created = await prisma.wishlistIngredient.create({
      data: {
        userId,
        ingredientId: resolvedIngredientId,
        name_en: name_en ?? ("" as string),
        name_bn: name_bn ?? undefined,
      },
    });
    return NextResponse.json({ success: true, item: created });
  } catch (e) {
    console.error("/api/user/wishlist POST error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE { id?: number, ingredientId?: number }
export async function DELETE(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ingredientId } = body as { id?: number; ingredientId?: number };
    if (!id && !ingredientId)
      return NextResponse.json(
        { error: "id or ingredientId required" },
        { status: 400 }
      );

    if (id && typeof id === "number") {
      await prisma.wishlistIngredient.deleteMany({ where: { id, userId } });
      return NextResponse.json({ success: true });
    }

    if (ingredientId && typeof ingredientId === "number") {
      await prisma.wishlistIngredient.deleteMany({
        where: { ingredientId, userId },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Nothing deleted" }, { status: 400 });
  } catch (e) {
    console.error("/api/user/wishlist DELETE error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
