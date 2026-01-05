"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon, Youtube } from "lucide-react";
import AlertModal from "@/components/AlertModal";

interface RecipeFormData {
  slug: string;
  title_en: string;
  title_bn: string;
  image: string;
  youtube_url: string;
  youtube_id: string;
  cuisine: string;
  category: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: Array<{
    ingredient_id?: number;
    name_en: string;
    name_bn: string;
    quantity: string;
    unit_en: string;
    unit_bn: string;
    notes_en: string;
    notes_bn: string;
  }>;
  steps: Array<{
    step_number: number;
    instruction_en: string;
    instruction_bn: string;
    timestamp: string;
  }>;
  blogContent: {
    intro_en: string;
    intro_bn: string;
    what_makes_it_special_en: string;
    what_makes_it_special_bn: string;
    cooking_tips_en: string;
    cooking_tips_bn: string;
    serving_en: string;
    serving_bn: string;
    storage_en: string;
    storage_bn: string;
    full_blog_en: string;
    full_blog_bn: string;
  };
}

export default function EditRecipe({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<RecipeFormData | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);

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
    fetchRecipe();
    fetchIngredients();
  }, [id]);

  async function fetchRecipe() {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/recipes/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch recipe");
      }
      
      // Transform the data to match form structure
      const transformed: RecipeFormData = {
        slug: data.slug,
        title_en: data.title_en,
        title_bn: data.title_bn,
        image: data.image,
        youtube_url: data.youtube_url,
        youtube_id: data.youtube_id || "",
        cuisine: data.cuisine,
        category: data.category,
        difficulty: data.difficulty,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        servings: data.servings,
        ingredients: data.ingredients?.map((ri: any) => ({
          ingredient_id: ri.ingredient.id,
          name_en: ri.ingredient.name_en,
          name_bn: ri.ingredient.name_bn,
          quantity: ri.quantity,
          unit_en: ri.unit_en,
          unit_bn: ri.unit_bn,
          notes_en: ri.notes_en || "",
          notes_bn: ri.notes_bn || "",
        })) || [],
        steps: data.steps?.map((s: any) => ({
          step_number: s.step_number,
          instruction_en: s.instruction_en,
          instruction_bn: s.instruction_bn,
          timestamp: s.timestamp || "",
        })) || [],
        blogContent: data.blogContent || {
          intro_en: "",
          intro_bn: "",
          what_makes_it_special_en: "",
          what_makes_it_special_bn: "",
          cooking_tips_en: "",
          cooking_tips_bn: "",
          serving_en: "",
          serving_bn: "",
          storage_en: "",
          storage_bn: "",
          full_blog_en: "",
          full_blog_bn: "",
        },
      };
      
      setRecipe(transformed);
    } catch (error: any) {
      console.error("Failed to fetch recipe:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: error.message || "Failed to load recipe",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchIngredients() {
    try {
      const res = await fetch("/api/ingredients?limit=1000");
      const data = await res.json();
      setAvailableIngredients(data.ingredients || []);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    }
  }

  async function handleSave() {
    if (!recipe) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/recipes/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(recipe),
      });

      if (res.ok) {
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: "Recipe updated successfully!",
          type: "success",
        });
        setTimeout(() => router.push("/admin/recipes"), 1500);
      } else {
        const error = await res.json();
        setAlertConfig({
          isOpen: true,
          title: "Error",
          message: error.error || "Failed to update recipe",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Something went wrong while saving the recipe.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function addIngredient() {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      ingredients: [
        ...recipe.ingredients,
        {
          name_en: "",
          name_bn: "",
          quantity: "",
          unit_en: "",
          unit_bn: "",
          notes_en: "",
          notes_bn: "",
        },
      ],
    });
  }

  function removeIngredient(index: number) {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter((_, i) => i !== index),
    });
  }

  function addStep() {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      steps: [
        ...recipe.steps,
        {
          step_number: recipe.steps.length + 1,
          instruction_en: "",
          instruction_bn: "",
          timestamp: "",
        },
      ],
    });
  }

  function removeStep(index: number) {
    if (!recipe) return;
    const newSteps = recipe.steps.filter((_, i) => i !== index);
    // Renumber steps
    newSteps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setRecipe({ ...recipe, steps: newSteps });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!recipe) {
    return <div className="text-center py-20">Recipe not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/recipes")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-gray-900">Edit Recipe</h2>
            <p className="text-gray-600">Update recipe information</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-colors shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="text-xl font-black text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Slug (URL)</label>
            <input
              type="text"
              value={recipe.slug}
              onChange={(e) => setRecipe({ ...recipe, slug: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">YouTube ID</label>
            <input
              type="text"
              value={recipe.youtube_id}
              onChange={(e) => setRecipe({ ...recipe, youtube_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title (English)</label>
            <input
              type="text"
              value={recipe.title_en}
              onChange={(e) => setRecipe({ ...recipe, title_en: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title (বাংলা)</label>
            <input
              type="text"
              value={recipe.title_bn}
              onChange={(e) => setRecipe({ ...recipe, title_bn: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
            <input
              type="text"
              value={recipe.image}
              onChange={(e) => setRecipe({ ...recipe, image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">YouTube URL</label>
            <input
              type="text"
              value={recipe.youtube_url}
              onChange={(e) => setRecipe({ ...recipe, youtube_url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cuisine</label>
            <select
              value={recipe.cuisine}
              onChange={(e) => setRecipe({ ...recipe, cuisine: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Indian">Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Thai">Thai</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="American">American</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Middle Eastern">Middle Eastern</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              value={recipe.category}
              onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Appetizer">Appetizer</option>
              <option value="Main Course">Main Course</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Beverage">Beverage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
            <select
              value={recipe.difficulty}
              onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Prep Time (min)</label>
            <input
              type="number"
              value={recipe.prep_time}
              onChange={(e) => setRecipe({ ...recipe, prep_time: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cook Time (min)</label>
            <input
              type="number"
              value={recipe.cook_time}
              onChange={(e) => setRecipe({ ...recipe, cook_time: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Servings</label>
            <input
              type="number"
              value={recipe.servings}
              onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">Ingredients</h3>
          <button
            onClick={addIngredient}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            <Plus size={16} />
            Add Ingredient
          </button>
        </div>

        <div className="space-y-3">
          {recipe.ingredients.map((ing, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 p-4 bg-gray-50 rounded-xl">
              <input
                type="text"
                placeholder="Name (EN)"
                value={ing.name_en}
                onChange={(e) => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[index].name_en = e.target.value;
                  setRecipe({ ...recipe, ingredients: newIngs });
                }}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Name (BN)"
                value={ing.name_bn}
                onChange={(e) => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[index].name_bn = e.target.value;
                  setRecipe({ ...recipe, ingredients: newIngs });
                }}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[index].quantity = e.target.value;
                  setRecipe({ ...recipe, ingredients: newIngs });
                }}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Unit (EN)"
                value={ing.unit_en}
                onChange={(e) => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[index].unit_en = e.target.value;
                  setRecipe({ ...recipe, ingredients: newIngs });
                }}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Unit (BN)"
                value={ing.unit_bn}
                onChange={(e) => {
                  const newIngs = [...recipe.ingredients];
                  newIngs[index].unit_bn = e.target.value;
                  setRecipe({ ...recipe, ingredients: newIngs });
                }}
                className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={() => removeIngredient(index)}
                className="col-span-1 p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">Steps</h3>
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            <Plus size={16} />
            Add Step
          </button>
        </div>

        <div className="space-y-3">
          {recipe.steps.map((step, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Step {step.step_number}</span>
                <button
                  onClick={() => removeStep(index)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                placeholder="Instruction (English)"
                value={step.instruction_en}
                onChange={(e) => {
                  const newSteps = [...recipe.steps];
                  newSteps[index].instruction_en = e.target.value;
                  setRecipe({ ...recipe, steps: newSteps });
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <textarea
                placeholder="Instruction (বাংলা)"
                value={step.instruction_bn}
                onChange={(e) => {
                  const newSteps = [...recipe.steps];
                  newSteps[index].instruction_bn = e.target.value;
                  setRecipe({ ...recipe, steps: newSteps });
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Timestamp (e.g., 2:30)"
                value={step.timestamp}
                onChange={(e) => {
                  const newSteps = [...recipe.steps];
                  newSteps[index].timestamp = e.target.value;
                  setRecipe({ ...recipe, steps: newSteps });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Blog Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="text-xl font-black text-gray-900">Blog Content</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Intro (English)</label>
            <textarea
              value={recipe.blogContent.intro_en}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  blogContent: { ...recipe.blogContent, intro_en: e.target.value },
                })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Intro (বাংলা)</label>
            <textarea
              value={recipe.blogContent.intro_bn}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  blogContent: { ...recipe.blogContent, intro_bn: e.target.value },
                })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              What Makes it Special (English)
            </label>
            <textarea
              value={recipe.blogContent.what_makes_it_special_en}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  blogContent: { ...recipe.blogContent, what_makes_it_special_en: e.target.value },
                })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              What Makes it Special (বাংলা)
            </label>
            <textarea
              value={recipe.blogContent.what_makes_it_special_bn}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  blogContent: { ...recipe.blogContent, what_makes_it_special_bn: e.target.value },
                })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Blog (English)
            </label>
            <textarea
              value={recipe.blogContent.full_blog_en}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  blogContent: { ...recipe.blogContent, full_blog_en: e.target.value },
                })
              }
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Blog (বাংলা)
            </label>
            <textarea
              value={recipe.blogContent.full_blog_bn}
              onChange={(e) =>
                setRecipe({
                  ...recipe,
                  blogContent: { ...recipe.blogContent, full_blog_bn: e.target.value },
                })
              }
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={24} />
              Save All Changes
            </>
          )}
        </button>
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
