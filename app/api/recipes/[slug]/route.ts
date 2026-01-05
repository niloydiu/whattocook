import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/recipes/[slug] - Get a single recipe by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name_en: true,
                name_bn: true,
                img: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
        steps: {
          orderBy: { step_number: "asc" },
        },
        blogContent: true,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[slug] - Update a recipe by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();

    const {
      title_en,
      title_bn,
      image,
      youtube_url,
      cuisine,
      category,
      difficulty,
      prep_time,
      cook_time,
      servings,
      ingredients,
      blogContent,
      steps,
      createMissing = false,
    } = body;

    const existing = await prisma.recipe.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // If ingredients provided, validate same as POST
    const resolvedIngredients: Array<any> = [];
    const missing: string[] = [];
    if (Array.isArray(ingredients)) {
      for (const it of ingredients) {
        if (it.ingredient_id) {
          const found = await prisma.ingredient.findUnique({
            where: { id: Number(it.ingredient_id) },
          });
          if (!found) missing.push(String(it.ingredient_id));
          else resolvedIngredients.push({ ingredientId: found.id, meta: it });
        } else if (it.name_en || it.name_bn) {
          const found = await prisma.ingredient.findFirst({
            where: {
              OR: [
                it.name_en ? { name_en: it.name_en } : undefined,
                it.name_bn ? { name_bn: it.name_bn } : undefined,
              ].filter(Boolean) as any,
            },
          });
          if (!found) {
            if (createMissing) {
              const created = await prisma.ingredient.create({
                data: {
                  name_en: it.name_en ?? it.name_bn ?? "",
                  name_bn: it.name_bn ?? it.name_en ?? "",
                  img: it.img ?? "",
                  phonetic: [],
                },
              });
              resolvedIngredients.push({ ingredientId: created.id, meta: it });
            } else {
              missing.push(it.name_en ?? it.name_bn ?? "unknown");
            }
          } else {
            resolvedIngredients.push({ ingredientId: found.id, meta: it });
          }
        } else {
          missing.push("unknown");
        }
      }
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing ingredients", missing },
        { status: 422 }
      );
    }

    // Build update payload
    const updateData: any = {
      title_en,
      title_bn,
      image,
      youtube_url,
      cuisine,
      category,
      difficulty,
      prep_time,
      cook_time,
      servings,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    // Update recipe
    const updated = await prisma.recipe.update({
      where: { slug },
      data: {
        ...updateData,
        // replace ingredients if provided
        ...(Array.isArray(ingredients)
          ? {
              ingredients: {
                deleteMany: {},
                create: resolvedIngredients.map((r: any) => ({
                  ingredient_id: Number(r.ingredientId),
                  quantity: r.meta.quantity ?? "",
                  unit_en: r.meta.unit_en ?? "",
                  unit_bn: r.meta.unit_bn ?? "",
                  notes_en: r.meta.notes_en ?? null,
                  notes_bn: r.meta.notes_bn ?? null,
                })),
              },
            }
          : {}),
        // replace steps
        ...(Array.isArray(steps)
          ? {
              steps: {
                deleteMany: {},
                create: steps.map((s: any) => ({
                  step_number: Number(s.step_number) || 0,
                  instruction_en: s.instruction_en ?? "",
                  instruction_bn: s.instruction_bn ?? "",
                  timestamp: s.timestamp ?? null,
                })),
              },
            }
          : {}),
        // upsert blogContent
        ...(blogContent
          ? {
              blogContent: {
                upsert: {
                  create: {
                    intro_en: blogContent.intro_en ?? "",
                    intro_bn: blogContent.intro_bn ?? "",
                    what_makes_it_special_en:
                      blogContent.what_makes_it_special_en ?? "",
                    what_makes_it_special_bn:
                      blogContent.what_makes_it_special_bn ?? "",
                    cooking_tips_en: blogContent.cooking_tips_en ?? "",
                    cooking_tips_bn: blogContent.cooking_tips_bn ?? "",
                    serving_en: blogContent.serving_en ?? "",
                    serving_bn: blogContent.serving_bn ?? "",
                    storage_en: blogContent.storage_en ?? null,
                    storage_bn: blogContent.storage_bn ?? null,
                    full_blog_en: blogContent.full_blog_en ?? "",
                    full_blog_bn: blogContent.full_blog_bn ?? "",
                  },
                  update: {
                    intro_en: blogContent.intro_en ?? undefined,
                    intro_bn: blogContent.intro_bn ?? undefined,
                    what_makes_it_special_en:
                      blogContent.what_makes_it_special_en ?? undefined,
                    what_makes_it_special_bn:
                      blogContent.what_makes_it_special_bn ?? undefined,
                    cooking_tips_en: blogContent.cooking_tips_en ?? undefined,
                    cooking_tips_bn: blogContent.cooking_tips_bn ?? undefined,
                    serving_en: blogContent.serving_en ?? undefined,
                    serving_bn: blogContent.serving_bn ?? undefined,
                    storage_en: blogContent.storage_en ?? undefined,
                    storage_bn: blogContent.storage_bn ?? undefined,
                    full_blog_en: blogContent.full_blog_en ?? undefined,
                    full_blog_bn: blogContent.full_blog_bn ?? undefined,
                  },
                },
              },
            }
          : {}),
      },
      include: { ingredients: true, steps: true, blogContent: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[slug] - Delete a recipe by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const existing = await prisma.recipe.findUnique({ where: { slug } });
    if (!existing)
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    await prisma.recipe.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
