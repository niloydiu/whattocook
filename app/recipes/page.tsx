import React from "react";
import AllRecipesClient from "../../components/AllRecipesClient";
import { getRecipeCategories, getRecipes } from "../actions/recipes";

export const dynamic = "force-dynamic";

export default async function AllRecipesPage() {
  const [{ categories, foodCategories }, recipesData] = await Promise.all([
    getRecipeCategories(),
    getRecipes({ limit: 12, page: 1 }),
  ]);

  // Combine categories and foodCategories for the filter buttons
  const allCategories = [...categories, ...foodCategories];

  return (
    <AllRecipesClient
      initialRecipes={recipesData.recipes}
      initialCategories={allCategories}
      initialTotal={recipesData.pagination.total}
    />
  );
}
