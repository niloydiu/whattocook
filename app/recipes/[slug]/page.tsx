import React from "react";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./RecipeDetailClient";
import { getRecipeBySlug, getYouTubeMetadata } from "../../actions/recipes";

export async function generateMetadata({ params }: any) {
  const { slug } = params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};

  const title = recipe.title_en || recipe.title_bn || "Recipe";
  const description =
    recipe.blogContent?.intro_en || recipe.description || "Delicious recipe";
  const image = recipe.image || "/recipe-placeholder.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
      type: "article",
    },
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  let videoStats = null;
  if (recipe.youtube_id) {
    videoStats = await getYouTubeMetadata(recipe.youtube_id);
  }

  // Build simple JSON-LD recipe schema
  try {
    const schema: any = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      name: recipe.title_en || recipe.title_bn,
      image: recipe.image ? [recipe.image] : ["/recipe-placeholder.jpg"],
      recipeCuisine: recipe.cuisine || undefined,
      recipeCategory: recipe.category || undefined,
      recipeIngredient: recipe.ingredients
        ? recipe.ingredients.map((i: any) =>
            `${i.quantity || ""} ${i.unit_en || ""} ${
              i.ingredient.name_en
            }`.trim()
          )
        : undefined,
      recipeInstructions: recipe.steps
        ? recipe.steps.map((s: any) => ({
            "@type": "HowToStep",
            text: s.instruction_en || s.instruction_bn,
          }))
        : undefined,
      cookTime: recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
      prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
      recipeYield: recipe.servings ? String(recipe.servings) : undefined,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <RecipeDetailClient recipe={recipe} videoStats={videoStats} />
      </>
    );
  } catch (err) {
    return <RecipeDetailClient recipe={recipe} videoStats={videoStats} />;
  }
}
