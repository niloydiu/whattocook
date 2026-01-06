import React from "react";
import LandingPageClient from "../components/LandingPageClient";
import {
  getRecipeCategories,
  getRecipes,
  getTotalRecipeCount,
} from "./actions/recipes";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Fetch initial data on the server for faster initial loading
  const [{ categories, foodCategories }, { recipes }, totalRecipes] =
    await Promise.all([
      getRecipeCategories(),
      getRecipes({ limit: 6 }),
      getTotalRecipeCount(),
    ]);

  // Combine categories and foodCategories for the filter buttons
  const allCategories = [...categories, ...foodCategories];

  return (
    <LandingPageClient
      initialRecipes={recipes}
      initialCategories={allCategories}
      totalRecipes={totalRecipes}
    />
  );
}
