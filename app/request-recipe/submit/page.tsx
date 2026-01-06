"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useLanguage from "@/hooks/useLanguage";

type Ingredient = {
  name_en: string;
  name_bn: string;
  quantity: string;
  unit_en: string;
  unit_bn: string;
  notes_en?: string;
  notes_bn?: string;
};

type Step = {
  step_number: number;
  instruction_en: string;
  instruction_bn: string;
  timestamp?: string;
};

const FOOD_CATEGORIES = [
  { value: "Savory", label_en: "Savory", label_bn: "ঝাল/নোনতা" },
  { value: "Sweet", label_en: "Sweet", label_bn: "মিষ্টি" },
  { value: "Spicy", label_en: "Spicy", label_bn: "ঝাল" },
  { value: "Sour", label_en: "Sour", label_bn: "টক" },
  { value: "Dessert", label_en: "Dessert", label_bn: "ডেজার্ট" },
  { value: "Drinks", label_en: "Drinks", label_bn: "পানীয়" },
  { value: "Appetizer", label_en: "Appetizer", label_bn: "অ্যাপেটাইজার" },
  { value: "Soup", label_en: "Soup", label_bn: "স্যুপ" },
  { value: "Salad", label_en: "Salad", label_bn: "সালাদ" },
];

export default function SubmitRecipePage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title_en: "",
    title_bn: "",
    cuisine: "",
    category: "",
    foodCategory: "Savory",
    difficulty: "Medium",
    prep_time: 30,
    cook_time: 30,
    servings: 4,
    userEmail: "",
    userName: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name_en: "", name_bn: "", quantity: "", unit_en: "", unit_bn: "" },
  ]);

  const [steps, setSteps] = useState<Step[]>([
    { step_number: 1, instruction_en: "", instruction_bn: "" },
  ]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name_en: "", name_bn: "", quantity: "", unit_en: "", unit_bn: "" },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
        instruction_en: "",
        instruction_bn: "",
      },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const recipeData = {
      ...formData,
      ingredients,
      steps,
    };

    try {
      const response = await fetch("/api/recipe-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "submit",
          title: formData.title_en,
          recipeData,
          userEmail: formData.userEmail,
          userName: formData.userName,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/request-recipe"), 3000);
      }
    } catch (error) {
      console.error("Error submitting recipe:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 4;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-slate-100/80 max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">
            {locale === "en" ? "Recipe Submitted!" : "রেসিপি জমা হয়েছে!"}
          </h2>
          <p className="text-slate-600 font-medium">
            {locale === "en"
              ? "Thank you for sharing! We'll review and add it soon."
              : "শেয়ার করার জন্য ধন্যবাদ! আমরা শীঘ্রই পর্যালোচনা করে যোগ করব।"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
                  step <= currentStep
                    ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-md"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-600 text-center font-bold">
            {locale === "en" ? "Step" : "ধাপ"} {currentStep} {locale === "en" ? "of" : "এর"} {totalSteps}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/80 p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-6">
                  {locale === "en" ? "Basic Information" : "মৌলিক তথ্য"}
                </h2>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Recipe Name (English)" : "রেসিপির নাম (ইংরেজি)"}
                      </label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                        placeholder="Chicken Curry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Recipe Name (Bangla)" : "রেসিপির নাম (বাংলা)"}
                      </label>
                      <input
                        type="text"
                        value={formData.title_bn}
                        onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                        placeholder="চিকেন কারি"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Cuisine" : "খাবারের ধরন"}
                      </label>
                      <input
                        type="text"
                        value={formData.cuisine}
                        onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                        placeholder="Indian, Bengali, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Category" : "শ্রেণী"}
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                        placeholder="Main Course, Snack, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {locale === "en" ? "Food Category" : "খাবারের বিভাগ"}
                    </label>
                    <select
                      value={formData.foodCategory}
                      onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                    >
                      {FOOD_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {locale === "en" ? cat.label_en : cat.label_bn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Prep Time (min)" : "প্রস্তুতি (মিনিট)"}
                      </label>
                      <input
                        type="number"
                        value={formData.prep_time}
                        onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Cook Time (min)" : "রান্না (মিনিট)"}
                      </label>
                      <input
                        type="number"
                        value={formData.cook_time}
                        onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Servings" : "পরিমাণ"}
                      </label>
                      <input
                        type="number"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {locale === "en" ? "Difficulty" : "কঠিনতা"}
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                      >
                        <option value="Easy">{locale === "en" ? "Easy" : "সহজ"}</option>
                        <option value="Medium">{locale === "en" ? "Medium" : "মাঝারি"}</option>
                        <option value="Hard">{locale === "en" ? "Hard" : "কঠিন"}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Ingredients */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-6">
                  {locale === "en" ? "Ingredients" : "উপকরণ"}
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-700">
                          {locale === "en" ? "Ingredient" : "উপকরণ"} #{index + 1}
                        </span>
                        {ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredient(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder={locale === "en" ? "Name (English)" : "নাম (ইংরেজি)"}
                          value={ing.name_en}
                          onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[index].name_en = e.target.value;
                            setIngredients(newIng);
                          }}
                          className="px-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                        />

                        <input
                          type="text"
                          placeholder={locale === "en" ? "Name (Bangla)" : "নাম (বাংলা)"}
                          value={ing.name_bn}
                          onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[index].name_bn = e.target.value;
                            setIngredients(newIng);
                          }}
                          className="px-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                        />

                        <input
                          type="text"
                          placeholder={locale === "en" ? "Quantity" : "পরিমাণ"}
                          value={ing.quantity}
                          onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[index].quantity = e.target.value;
                            setIngredients(newIng);
                          }}
                          className="px-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                        />

                        <input
                          type="text"
                          placeholder={locale === "en" ? "Unit" : "একক"}
                          value={ing.unit_en}
                          onChange={(e) => {
                            const newIng = [...ingredients];
                            newIng[index].unit_en = e.target.value;
                            newIng[index].unit_bn = e.target.value;
                            setIngredients(newIng);
                          }}
                          className="px-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addIngredient}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-xl font-bold hover:from-red-100 hover:to-orange-100 border border-red-200/50 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Plus size={20} />
                  {locale === "en" ? "Add Ingredient" : "উপকরণ যোগ করুন"}
                </button>
              </motion.div>
            )}

            {/* Step 3: Instructions */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-6">
                  {locale === "en" ? "Cooking Steps" : "রান্নার ধাপ"}
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {steps.map((step, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-700">
                          {locale === "en" ? "Step" : "ধাপ"} {step.step_number}
                        </span>
                        {steps.length > 1 && (
                          <button
                            onClick={() => removeStep(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <textarea
                          placeholder={locale === "en" ? "Instruction (English)" : "নির্দেশনা (ইংরেজি)"}
                          value={step.instruction_en}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index].instruction_en = e.target.value;
                            setSteps(newSteps);
                          }}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-sm resize-none bg-slate-50 text-slate-700 font-medium transition-all"
                        />

                        <textarea
                          placeholder={locale === "en" ? "Instruction (Bangla)" : "নির্দেশনা (বাংলা)"}
                          value={step.instruction_bn}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index].instruction_bn = e.target.value;
                            setSteps(newSteps);
                          }}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none text-sm resize-none bg-slate-50 text-slate-700 font-medium transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addStep}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-xl font-bold hover:from-red-100 hover:to-orange-100 border border-red-200/50 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Plus size={20} />
                  {locale === "en" ? "Add Step" : "ধাপ যোগ করুন"}
                </button>
              </motion.div>
            )}

            {/* Step 4: Contact Info */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-black text-slate-900 mb-6">
                  {locale === "en" ? "Your Information (Optional)" : "আপনার তথ্য (ঐচ্ছিক)"}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {locale === "en" ? "Your Name" : "আপনার নাম"}
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                      placeholder={locale === "en" ? "John Doe" : "আপনার নাম"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {locale === "en" ? "Your Email" : "আপনার ইমেইল"}
                    </label>
                    <input
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all bg-slate-50 text-slate-700 font-medium"
                      placeholder="john@example.com"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {locale === "en"
                        ? "We'll notify you when your recipe is approved"
                        : "আপনার রেসিপি অনুমোদিত হলে আমরা আপনাকে জানাব"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border-2 border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <ArrowLeft size={20} />
              {locale === "en" ? "Previous" : "পূর্ববর্তী"}
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                {locale === "en" ? "Next" : "পরবর্তী"}
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {locale === "en" ? "Submitting..." : "জমা দেওয়া হচ্ছে..."}
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    {locale === "en" ? "Submit Recipe" : "রেসিপি জমা দিন"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
