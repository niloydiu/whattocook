"use client";

import { useState } from "react";
import { createRecipeWithIngredients } from "../actions/createRecipe";
import AlertModal from "@/components/AlertModal";

export default function AddRecipePage() {
  const [recipeJson, setRecipeJson] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipeData = JSON.parse(recipeJson);
      const token = localStorage.getItem("adminToken") || "";
      const result = await createRecipeWithIngredients(recipeData, token);

      if (result.success) {
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: result.message || "Recipe created successfully!",
          type: "success",
        });
        setRecipeJson(""); // Clear the form
      } else {
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: result.error || "Failed to create recipe",
          type: "error",
        });
      }
    } catch (error: any) {
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: error.message || "Invalid JSON format",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleRecipe = {
    slug: "example-recipe",
    title_en: "Example Recipe",
    title_bn: "উদাহরণ রেসিপি",
    image: "https://example.com/image.jpg",
    youtube_url: "https://www.youtube.com/watch?v=xxxxx",
    youtube_id: "xxxxx",
    cuisine: "Indian",
    category: "Main Course",
    difficulty: "Medium",
    prep_time: 20,
    cook_time: 40,
    servings: 4,
    ingredients: [
      {
        name_en: "Onion",
        name_bn: "পেঁয়াজ",
        quantity: "2",
        unit_en: "pieces",
        unit_bn: "টি",
        notes_en: "Medium sized",
        notes_bn: "মাঝারি সাইজের",
      },
    ],
    steps: [
      {
        step_number: 1,
        instruction_en: "Chop the onions",
        instruction_bn: "পেঁয়াজ কুচি করুন",
        timestamp: "0:30",
      },
    ],
    blogContent: {
      intro_en: "Introduction",
      intro_bn: "ভূমিকা",
      what_makes_it_special_en: "What makes it special",
      what_makes_it_special_bn: "কী এটিকে বিশেষ করে তোলে",
      cooking_tips_en: "Cooking tips",
      cooking_tips_bn: "রান্নার টিপস",
      serving_en: "Serving suggestions",
      serving_bn: "পরিবেশনের পরামর্শ",
      storage_en: "Storage instructions",
      storage_bn: "সংরক্ষণ নির্দেশনা",
      full_blog_en: "Full blog content",
      full_blog_bn: "সম্পূর্ণ ব্লগ বিষয়বস্তু",
    },
    newIngredients: [],
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Recipe</h1>
        <p className="mt-2 text-gray-600">
          Paste your recipe JSON data below. Ingredients will be automatically
          validated and created if they don't exist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="recipeJson"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Recipe JSON
          </label>
          <textarea
            id="recipeJson"
            rows={25}
            value={recipeJson}
            onChange={(e) => setRecipeJson(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={JSON.stringify(sampleRecipe, null, 2)}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Note: You can use either <code>ingredient_id</code> (if you know the
            ID) or <code>name_en</code>/<code>name_bn</code> in ingredients.
            Missing ingredients will be created automatically.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Recipe..." : "Create Recipe"}
          </button>

          <button
            type="button"
            onClick={() => setRecipeJson(JSON.stringify(sampleRecipe, null, 2))}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Load Sample
          </button>
        </div>
      </form>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          How it works:
        </h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>
            Ingredients are validated by <code>name_en</code> or{" "}
            <code>name_bn</code>
          </li>
          <li>If an ingredient doesn't exist, it will be created automatically</li>
          <li>All fields are validated before recipe creation</li>
          <li>YouTube ID is extracted from the URL if not provided</li>
          <li>
            Use the <code>newIngredients</code> array to pre-create ingredients
            with custom images
          </li>
        </ul>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
