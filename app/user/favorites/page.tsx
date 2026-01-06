"use client";

import React, { useEffect, useState } from "react";
import { useActiveUser } from "@/hooks/useActiveUser";
import { getFavoriteRecipes, toggleFavorite } from "@/app/actions/user";
import RecipeCard from "@/components/RecipeCard";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MyFavoritesPage() {
  const { user, loading: authLoading } = useActiveUser();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function loadFavorites() {
    if (!user) return;
    setLoading(true);
    const data = await getFavoriteRecipes(user.id);
    setRecipes(data);
    setLoading(false);
  }

  async function handleRemove(recipeId: number) {
    if (!user) return;
    const res = await toggleFavorite(user.id, recipeId);
    if (res.success) {
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <Heart size={48} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 text-center">
          Sign in to see your favorites
        </h1>
        <p className="text-slate-600 font-medium mb-8 text-center max-w-md">
          Save your favorite recipes to access them easily anytime.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-red-600 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Recipes
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-md">
            <Heart size={32} className="text-red-600 fill-red-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-1">
              My Favorites
            </h1>
            <p className="text-slate-600 font-medium">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
            </p>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100/80 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Your favorites list is empty
            </h3>
            <p className="text-slate-600 font-medium mb-6">
              Heart some recipes to see them here!
            </p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100/80 transition-all duration-300"
                >
                  <Link href={`/recipes/${recipe.slug}`} className="block">
                    <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {recipe.image ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title_en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Heart size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-black text-lg text-slate-900 mb-2 line-clamp-2">
                        {recipe.title_en}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">
                        {recipe.cuisine} • {recipe.category}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(recipe.id)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:scale-110 active:scale-95 transition-all"
                    title="Remove from favorites"
                  >
                    <Heart size={20} className="text-red-600 fill-red-600" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
