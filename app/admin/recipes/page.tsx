"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  X,
  Loader2,
  ChefHat,
} from "lucide-react";
import AlertModal from "@/components/AlertModal";
import { API_PATHS } from "@/lib/api-paths";

interface Recipe {
  id: number;
  slug: string;
  title_en: string;
  title_bn: string;
  image: string;
  cuisine: string;
  category: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  createdAt: string;
}

export default function RecipesManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCuisine, setFilterCuisine] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSummary, setScanSummary] = useState<string | null>(null);

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

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    try {
      const res = await fetch(`${API_PATHS.RECIPES}?limit=1000`);
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(API_PATHS.ADMIN_RECIPE_BY_ID(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setRecipes(recipes.filter((r) => r.id !== id));
        setDeleteId(null);
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: "Recipe deleted successfully!",
          type: "success",
        });
      } else {
        const data = await res.json();
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to delete recipe",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Something went wrong while deleting the recipe.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/recipes", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setRecipes(recipes.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
        setShowBulkDeleteConfirm(false);
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: `${selectedIds.length} recipes deleted successfully!`,
          type: "success",
        });
      } else {
        const data = await res.json();
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to delete recipes",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Something went wrong while deleting the recipes.",
        type: "error",
      });
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredRecipes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecipes.map((r) => r.id));
    }
  }

  function toggleSelectOne(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((idx) => idx !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.title_bn.includes(searchQuery);
    const matchesCuisine = !filterCuisine || recipe.cuisine === filterCuisine;
    const matchesCategory =
      !filterCategory || recipe.category === filterCategory;
    return matchesSearch && matchesCuisine && matchesCategory;
  });

  const cuisines = Array.from(new Set(recipes.map((r) => r.cuisine))).sort();
  const categories = Array.from(new Set(recipes.map((r) => r.category))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Manage Recipes</h2>
          <p className="text-gray-600 mt-1">
            {filteredRecipes.length} of {recipes.length} recipes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
            >
              <Trash2 size={20} />
              Delete {selectedIds.length} Selected
            </button>
          )}
          <Link
            href="/admin/add-recipe"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            <Plus size={20} />
            Add Recipe
          </Link>
          <button
            onClick={async () => {
              const token = localStorage.getItem("adminToken");
              if (!token) return setScanSummary("Not signed in");
              try {
                setScanning(true);
                setScanSummary(null);
                const res = await fetch("/api/admin/recipes/check-urls", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ fix: true }),
                });
                const data = await res.json();
                if (res.ok) {
                  const fixed = data.results.filter((r: any) => r.fixed).length;
                  setScanSummary(`${fixed} recipes updated`);
                  // refresh list
                  fetchRecipes();
                } else {
                  setScanSummary(data.error || "Scan failed");
                }
              } catch (err) {
                setScanSummary("Error during scan");
              } finally {
                setScanning(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            {scanning ? "Scanning..." : "Scan/Fix URLs"}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterCuisine}
            onChange={(e) => setFilterCuisine(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-select Header */}
        {filteredRecipes.length > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <input
              type="checkbox"
              checked={
                filteredRecipes.length > 0 &&
                selectedIds.length === filteredRecipes.length
              }
              onChange={toggleSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-700">
              Select All Visible ({filteredRecipes.length})
            </span>
          </div>
        )}
      </div>

      {/* Recipes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <ChefHat className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl p-6 border ${
                selectedIds.includes(recipe.id)
                  ? "border-blue-500 bg-blue-50/10"
                  : "border-gray-200"
              } hover:border-gray-300 transition-all shadow-sm hover:shadow-md cursor-pointer`}
              onClick={() => toggleSelectOne(recipe.id)}
            >
              <div className="flex items-center gap-6">
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(recipe.id)}
                    onChange={() => toggleSelectOne(recipe.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <img
                  src={recipe.image}
                  alt={recipe.title_en}
                  className="w-24 h-24 rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
                  }}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-gray-900 mb-1 truncate">
                    {recipe.title_en}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {recipe.title_bn}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {recipe.cuisine}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                      {recipe.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      {recipe.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                      {recipe.prep_time + recipe.cook_time} min
                    </span>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    target="_blank"
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                    title="View"
                  >
                    <Eye size={20} />
                  </Link>
                  <Link
                    href={`/admin/recipes/edit/${recipe.id}`}
                    className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </Link>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("adminToken");
                      if (!token) {
                        setAlertConfig({
                          isOpen: true,
                          title: "Error",
                          message: "Not signed in",
                          type: "error",
                        });
                        return;
                      }
                      try {
                        const res = await fetch(
                          `/api/admin/recipes/${recipe.id}/check-urls`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ fix: true }),
                          }
                        );
                        const data = await res.json();
                        if (res.ok && data.ok) {
                          if (data.fixed) {
                            setAlertConfig({
                              isOpen: true,
                              title: "Fixed",
                              message: "Recipe URLs updated",
                              type: "success",
                            });
                            fetchRecipes();
                          } else {
                            setAlertConfig({
                              isOpen: true,
                              title: "No changes",
                              message: "No URL changes detected",
                              type: "info",
                            });
                          }
                        } else if (res.ok && !data.ok) {
                          setAlertConfig({
                            isOpen: true,
                            title: "Result",
                            message: JSON.stringify(data),
                            type: "info",
                          });
                        } else {
                          setAlertConfig({
                            isOpen: true,
                            title: "Error",
                            message: data.error || "Failed",
                            type: "error",
                          });
                        }
                      } catch (err) {
                        setAlertConfig({
                          isOpen: true,
                          title: "Error",
                          message: "Request failed",
                          type: "error",
                        });
                      }
                    }}
                    className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl transition-colors"
                    title="Check/Fix URLs"
                  >
                    🔧
                  </button>
                  <button
                    onClick={() => setDeleteId(recipe.id)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Delete Recipe?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this recipe? This action cannot
                be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !bulkDeleting && setShowBulkDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Delete {selectedIds.length} Recipes?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedIds.length} selected
                recipes? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {bulkDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deleting...
                    </>
                  ) : (
                    "Delete All"
                  )}
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={bulkDeleting}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
