import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

async function getUserIdFromAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !SUPABASE_URL) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth } });
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
      { error: "SUPABASE_URL is not set — allergies require Supabase configuration (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)." },
      { status: 500 }
    );
  }
  return null;
}

// GET returns user's allergies
export async function GET(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const list = await prisma.userAllergy.findMany({ where: { userId } });
    return NextResponse.json({ allergies: list });
  } catch (e) {
    console.error("/api/user/allergies GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST { ingredientId?: number, name_en?: string, name_bn?: string }
export async function POST(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ingredientId, name_en, name_bn } = body;
    if (!ingredientId && !name_en) {
      return NextResponse.json({ error: "ingredientId or name_en required" }, { status: 400 });
    }

    // If ingredientId provided, ensure it exists. Otherwise try to find by name, or create a new Ingredient.
    let resolvedIngredientId: number | null = null;

    if (ingredientId && typeof ingredientId === "number") {
      const ing = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
      if (ing) resolvedIngredientId = ing.id;
    }

    if (!resolvedIngredientId && name_en) {
      // Try to find an existing ingredient by name (case-insensitive match)
      const found = await prisma.ingredient.findFirst({
        where: {
          OR: [
            { name_en: { equals: name_en, mode: "insensitive" } },
            { name_bn: { equals: name_en, mode: "insensitive" } },
            { name_en: { equals: name_bn ?? "", mode: "insensitive" } },
            { name_bn: { equals: name_bn ?? "", mode: "insensitive" } },
          ],
        },
      });

      if (found) {
        resolvedIngredientId = found.id;
      } else {
        // Create a minimal Ingredient record so we can reference it for allergy checks
        const createdIng = await prisma.ingredient.create({
          data: {
            name_en: name_en,
            name_bn: name_bn ?? "",
            img: "",
            phonetic: [],
          },
        });
        resolvedIngredientId = createdIng.id;
      }
    }

    const created = await prisma.userAllergy.create({ data: { userId, ingredientId: resolvedIngredientId, name_en: name_en ?? "", name_bn } });
    return NextResponse.json({ success: true, allergy: created });
  } catch (e) {
    console.error("/api/user/allergies POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE { id: number } — remove by allergy id
export async function DELETE(req: NextRequest) {
  try {
    const missing = ensureSupabaseConfigured();
    if (missing) return missing;

    const userId = await getUserIdFromAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = body;
    if (!id || typeof id !== "number") return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.userAllergy.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("/api/user/allergies DELETE error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
