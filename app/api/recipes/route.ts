import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/recipes - Search and get recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title_en: { contains: search, mode: "insensitive" } },
        { title_bn: { contains: search } },
      ];
    }

    if (cuisine) where.cuisine = cuisine;
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title_en: true,
          title_bn: true,
          image: true,
          cuisine: true,
          category: true,
          difficulty: true,
          prep_time: true,
          cook_time: true,
          servings: true,
          createdAt: true,
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      slug,
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

    if (!slug || (!title_en && !title_bn)) {
      return NextResponse.json(
        { error: "Missing required fields: slug or title" },
        { status: 422 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Recipe must include at least one ingredient" },
        { status: 422 }
      );
    }

    // Resolve ingredients: each item should have either `ingredient_id` or `name_en`/`name_bn`
    const missing: string[] = [];
    const resolvedIngredients: Array<any> = [];

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

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing ingredients", missing },
        { status: 422 }
      );
    }

    // Create recipe with nested recipeIngredients and steps/blogContent when provided
    const created = await prisma.recipe.create({
      data: {
        slug,
        title_en: title_en ?? "",
        title_bn: title_bn ?? "",
        image: image ?? "",
        youtube_url: youtube_url ?? "",
        cuisine: cuisine ?? "",
        category: category ?? "",
        difficulty: difficulty ?? "",
        prep_time: prep_time ?? 0,
        cook_time: cook_time ?? 0,
        servings: servings ?? 1,
        ingredients: {
          create: resolvedIngredients.map((r: any, idx: number) => ({
            ingredient_id: Number(r.ingredientId),
            quantity: r.meta.quantity ?? "",
            unit_en: r.meta.unit_en ?? "",
            unit_bn: r.meta.unit_bn ?? "",
            notes_en: r.meta.notes_en ?? null,
            notes_bn: r.meta.notes_bn ?? null,
          })),
        },
        steps: steps
          ? {
              create: steps.map((s: any) => ({
                step_number: Number(s.step_number) || 0,
                instruction_en: s.instruction_en ?? "",
                instruction_bn: s.instruction_bn ?? "",
                timestamp: s.timestamp ?? null,
              })),
            }
          : undefined,
        blogContent: blogContent
          ? {
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
            }
          : undefined,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
