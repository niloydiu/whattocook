"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import AlertModal from "@/components/AlertModal";

interface Ingredient {
  id: number;
  name_en: string;
  name_bn: string;
  img: string;
  phonetic: string[];
}

export default function IngredientsManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name_en");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterHasImage, setFilterHasImage] = useState<
    "any" | "with" | "without"
  >("any");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name_en: "",
    name_bn: "",
    img: "",
  });

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
    fetchIngredients();
  }, []);

  async function fetchIngredients() {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("adminToken")
          : null;
      const params = new URLSearchParams();
      params.set("limit", "1000");
      if (searchQuery) params.set("search", searchQuery);
      if (sortField) params.set("sortField", sortField);
      if (sortOrder) params.set("sortOrder", sortOrder);
      if (filterHasImage && filterHasImage !== "any") {
        params.set("hasImage", filterHasImage === "with" ? "true" : "false");
      }

      let url = "/api/ingredients?" + params.toString();
      const opts: RequestInit = {};

      // If we have an admin token, use admin endpoint with Authorization header
      if (token) {
        url = "/api/admin/ingredients?" + params.toString();
        opts.headers = { Authorization: `Bearer ${token}` } as any;
      }

      const res = await fetch(url, opts);
      const data = await res.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    } finally {
      setLoading(false);
    }
  }

  // refetch when sort/search changes
  useEffect(() => {
    // small debounce for search
    const id = setTimeout(() => fetchIngredients(), 150);
    return () => clearTimeout(id);
  }, [searchQuery, sortField, sortOrder, filterHasImage]);

  async function handleSave() {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = editId
        ? `/api/admin/ingredients/${editId}`
        : "/api/admin/ingredients";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, phonetic: [] }),
      });

      if (res.ok) {
        await fetchIngredients();
        setEditId(null);
        setShowAdd(false);
        setFormData({ name_en: "", name_bn: "", img: "" });
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: `Ingredient ${editId ? "updated" : "added"} successfully!`,
          type: "success",
        });
      } else {
        const data = await res.json();
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to save ingredient",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Something went wrong while saving the ingredient.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/ingredients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIngredients(ingredients.filter((i) => i.id !== id));
        setDeleteId(null);
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: "Ingredient deleted successfully!",
          type: "success",
        });
      } else {
        const data = await res.json();
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to delete ingredient",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Something went wrong while deleting the ingredient.",
        type: "error",
      });
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/ingredients", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setIngredients(ingredients.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
        setShowBulkDeleteConfirm(false);
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: `${selectedIds.length} ingredients deleted successfully!`,
          type: "success",
        });
      } else {
        const data = await res.json();
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: data.error || "Failed to delete ingredients",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Something went wrong while deleting the ingredients.",
        type: "error",
      });
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelectOne(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((idx) => idx !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function startEdit(ingredient: Ingredient) {
    setEditId(ingredient.id);
    setFormData({
      name_en: ingredient.name_en,
      name_bn: ingredient.name_bn,
      img: ingredient.img,
    });
    setShowAdd(true);
  }

  const filteredIngredients = ingredients.filter(
    (ing) =>
      ing.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.name_bn.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Manage Ingredients
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredIngredients.length} of {ingredients.length} ingredients
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
          <button
            onClick={() => {
              setShowAdd(true);
              setEditId(null);
              setFormData({ name_en: "", name_bn: "", img: "" });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            <Plus size={20} />
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Search and Selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {filteredIngredients.length > 0 && (
              <>
                <input
                  type="checkbox"
                  checked={
                    filteredIngredients.length > 0 &&
                    selectedIds.length === filteredIngredients.length
                  }
                  onChange={() => {
                    if (selectedIds.length === filteredIngredients.length)
                      setSelectedIds([]);
                    else setSelectedIds(filteredIngredients.map((i) => i.id));
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700">
                  Select All Visible ({filteredIngredients.length})
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 mr-2">Sort:</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none"
            >
              <option value="name_en">Name (EN)</option>
              <option value="name_bn">Name (BN)</option>
              <option value="id">ID</option>
              <option value="createdAt">Created</option>
            </select>

            <button
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100"
              title="Toggle sort order"
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </button>
            <label className="text-sm text-gray-600 ml-4 mr-2">Image:</label>
            <select
              value={filterHasImage}
              onChange={(e) =>
                setFilterHasImage(e.target.value as "any" | "with" | "without")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none"
            >
              <option value="any">All</option>
              <option value="with">With Image</option>
              <option value="without">Without Image</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ingredients Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-green-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ingredient) => (
            <motion.div
              key={ingredient.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => toggleSelectOne(ingredient.id)}
              className={`bg-white rounded-2xl p-6 border ${
                selectedIds.includes(ingredient.id)
                  ? "border-green-500 bg-green-50/10"
                  : "border-gray-200"
              } hover:border-gray-300 transition-all shadow-sm hover:shadow-md cursor-pointer relative`}
            >
              <div className="flex items-start gap-4">
                <div onClick={(e) => e.stopPropagation()} className="mt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ingredient.id)}
                    onChange={() => toggleSelectOne(ingredient.id)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </div>

                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {ingredient.img ? (
                    <img
                      src={ingredient.img}
                      alt={ingredient.name_en}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <ImageIcon className="text-gray-400" size={24} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-gray-900 truncate">
                    {ingredient.name_en}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {ingredient.name_bn}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ID: {ingredient.id}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-2 mt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => startEdit(ingredient)}
                  className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(ingredient.id)}
                  className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !saving && setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6">
                {editId ? "Edit Ingredient" : "Add Ingredient"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    English Name
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) =>
                      setFormData({ ...formData, name_en: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g., Tomato"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Bangla Name
                  </label>
                  <input
                    type="text"
                    value={formData.name_bn}
                    onChange={(e) =>
                      setFormData({ ...formData, name_bn: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g., টমেটো"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.img}
                    onChange={(e) =>
                      setFormData({ ...formData, img: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                  {formData.img && (
                    <div className="mt-2 w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.img}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name_en || !formData.name_bn}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Delete Ingredient?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure? This will affect recipes using this ingredient.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
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
