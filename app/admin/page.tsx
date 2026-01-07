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
import { API_PATHS } from "@/lib/api-paths";

interface Stats {
  recipes: number;
  ingredients: number;
  categories: { name: string; count: number }[];
  cuisines: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [scanningUrls, setScanningUrls] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [recipesRes, ingredientsRes] = await Promise.all([
        fetch(`${API_PATHS.RECIPES}?limit=1000`),
        fetch(`${API_PATHS.INGREDIENTS}?limit=1000`),
      ]);

      const recipesData = await recipesRes.json();
      const ingredientsData = await ingredientsRes.json();

      const recipes = recipesData.recipes || [];
      const ingredients = ingredientsData.ingredients || [];

      const categoryMap = new Map<string, number>();
      const cuisineMap = new Map<string, number>();

      recipes.forEach((recipe: any) => {
        categoryMap.set(
          recipe.category,
          (categoryMap.get(recipe.category) || 0) + 1
        );
        cuisineMap.set(
          recipe.cuisine,
          (cuisineMap.get(recipe.cuisine) || 0) + 1
        );
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
        <h2 className="text-3xl font-black text-slate-900">Dashboard</h2>
        <p className="text-slate-600 font-medium">Manage your recipe platform</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={async () => {
              const token = localStorage.getItem("adminToken");
              if (!token) {
                setSyncStatus("Not signed in");
                return;
              }

              try {
                setSyncing(true);
                setSyncStatus(null);
                const res = await fetch("/api/admin/trigger-sync", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok && data.ok) {
                  setSyncStatus("Triggered export workflow");
                } else {
                  setSyncStatus(
                    `Failed: ${data.error || data.detail || res.status}`
                  );
                }
              } catch (err) {
                setSyncStatus("Error triggering sync");
              } finally {
                setSyncing(false);
              }
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-bold"
          >
            {syncing ? "Triggering..." : "Run Sync Now"}
          </button>

          <button
            onClick={async () => {
              const token = localStorage.getItem("adminToken");
              if (!token) {
                setScanStatus("Not signed in");
                return;
              }

              try {
                setScanningUrls(true);
                setScanStatus(null);
                const res = await fetch("/api/admin/recipes/check-urls", {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ fix: true }),
                });
                const data = await res.json();
                if (res.ok && data.ok) {
                  const fixed = (data.results || []).filter((r: any) => r.fixed).length;
                  setScanStatus(`${fixed} recipes updated`);
                } else {
                  setScanStatus(data.error || `Scan failed: ${res.status}`);
                }
              } catch (err) {
                setScanStatus("Error during scan");
              } finally {
                setScanningUrls(false);
              }
            }}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold"
          >
            {scanningUrls ? "Scanning..." : "Scan/Fix URLs"}
          </button>

          {scanStatus && (
            <span className="text-sm text-slate-600">{scanStatus}</span>
          )}
          {syncStatus && (
            <span className="text-sm text-slate-600">{syncStatus}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Total Recipes</p>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-blue-900">
            {loading ? "..." : stats?.recipes || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-green-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Ingredients</p>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Utensils className="text-green-600" size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-green-900">
            {loading ? "..." : stats?.ingredients || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-purple-700 uppercase tracking-wider">Categories</p>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Database className="text-purple-600" size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-purple-900">
            {loading ? "..." : stats?.categories.length || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-orange-700 uppercase tracking-wider">Cuisines</p>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <Sparkles className="text-orange-600" size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-orange-900">
            {loading ? "..." : stats?.cuisines.length || 0}
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-black text-slate-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">
                  {action.title}
                </h4>
                <p className="text-sm text-slate-600 font-medium">{action.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Breakdown */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-100 shadow-lg">
            <h4 className="text-xl font-black text-slate-900 mb-6">
              Recipe Categories
            </h4>
            <div className="space-y-4">
              {stats.categories.slice(0, 5).map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{
                          width: `${(cat.count / stats.recipes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900 w-8 text-right">
                      {cat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-100 shadow-lg">
            <h4 className="text-xl font-black text-slate-900 mb-6">
              Recipe Cuisines
            </h4>
            <div className="space-y-4">
              {stats.cuisines.slice(0, 5).map((cuisine) => (
                <div
                  key={cuisine.name}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {cuisine.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                        style={{
                          width: `${(cuisine.count / stats.recipes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900 w-8 text-right">
                      {cuisine.count}
                    </span>
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
