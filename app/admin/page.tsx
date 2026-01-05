"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChefHat,
  Plus,
  BookOpen,
  Utensils,
  BarChart3,
  Youtube,
  Sparkles,
  Database,
} from "lucide-react";

interface Stats {
  recipes: number;
  ingredients: number;
  categories: { name: string; count: number }[];
  cuisines: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [recipesRes, ingredientsRes] = await Promise.all([
        fetch("/api/recipes?limit=1000"),
        fetch("/api/ingredients?limit=1000"),
      ]);

      const recipesData = await recipesRes.json();
      const ingredientsData = await ingredientsRes.json();

      const recipes = recipesData.recipes || [];
      const ingredients = ingredientsData.ingredients || [];

      const categoryMap = new Map<string, number>();
      const cuisineMap = new Map<string, number>();

      recipes.forEach((recipe: any) => {
        categoryMap.set(recipe.category, (categoryMap.get(recipe.category) || 0) + 1);
        cuisineMap.set(recipe.cuisine, (cuisineMap.get(recipe.cuisine) || 0) + 1);
      });

      setStats({
        recipes: recipes.length,
        ingredients: ingredients.length,
        categories: Array.from(categoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        cuisines: Array.from(cuisineMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    {
      title: "Add Recipe",
      description: "Create new recipe from JSON",
      icon: Plus,
      href: "/admin/add-recipe",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Manage Recipes",
      description: "View, edit, delete recipes",
      icon: BookOpen,
      href: "/admin/recipes",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Manage Ingredients",
      description: "Add, edit, delete ingredients",
      icon: Utensils,
      href: "/admin/ingredients",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Import from YouTube",
      description: "Extract recipe from video",
      icon: Youtube,
      href: "/admin/import",
      color: "from-red-500 to-red-600",
    },
    {
      title: "Admin Users",
      description: "Manage admin accounts",
      icon: ChefHat,
      href: "/admin/users",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Manage your recipe platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-blue-900">Total Recipes</p>
            <BookOpen className="text-blue-600" size={20} />
          </div>
          <p className="text-4xl font-black text-blue-900">{loading ? "..." : stats?.recipes || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-green-900">Ingredients</p>
            <Utensils className="text-green-600" size={20} />
          </div>
          <p className="text-4xl font-black text-green-900">{loading ? "..." : stats?.ingredients || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-purple-900">Categories</p>
            <Database className="text-purple-600" size={20} />
          </div>
          <p className="text-4xl font-black text-purple-900">{loading ? "..." : stats?.categories.length || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-orange-900">Cuisines</p>
            <Sparkles className="text-orange-600" size={20} />
          </div>
          <p className="text-4xl font-black text-orange-900">{loading ? "..." : stats?.cuisines.length || 0}</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer shadow-sm hover:shadow-lg"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Breakdown */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h4 className="text-lg font-black text-gray-900 mb-4">Recipe Categories</h4>
            <div className="space-y-3">
              {stats.categories.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(cat.count / stats.recipes) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-gray-900 w-8 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h4 className="text-lg font-black text-gray-900 mb-4">Recipe Cuisines</h4>
            <div className="space-y-3">
              {stats.cuisines.slice(0, 5).map((cuisine) => (
                <div key={cuisine.name} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{cuisine.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                        style={{ width: `${(cuisine.count / stats.recipes) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-gray-900 w-8 text-right">{cuisine.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
