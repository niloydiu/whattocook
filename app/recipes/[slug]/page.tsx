import React from "react";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./RecipeDetailClient";
import { getRecipeBySlug, getYouTubeMetadata } from "../../actions/recipes";

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

  return <RecipeDetailClient recipe={recipe} videoStats={videoStats} />;
}
