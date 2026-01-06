"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Search, X, Loader2, ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import useLanguage from "@/hooks/useLanguage";

type Ingredient = {
  id: number;
  name_en: string;
  name_bn: string;
};

export default function RequestByIngredientsPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredients");
        const data = await response.json();
        // Handle both array and object responses
        const ingredients = Array.isArray(data) ? data : data.ingredients || [];
        setAllIngredients(ingredients);
        setFilteredIngredients(ingredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        setAllIngredients([]);
        setFilteredIngredients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredIngredients(allIngredients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allIngredients.filter(
        (ing) =>
          ing.name_en.toLowerCase().includes(query) ||
          ing.name_bn.includes(query)
      );
      setFilteredIngredients(filtered);
    }
  }, [searchQuery, allIngredients]);

  const toggleIngredient = (ingredient: Ingredient) => {
    const isSelected = selectedIngredients.some(
      (ing) => ing.id === ingredient.id
    );
    if (isSelected) {
      setSelectedIngredients(
        selectedIngredients.filter((ing) => ing.id !== ingredient.id)
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleSubmit = async () => {
    if (selectedIngredients.length === 0) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/recipe-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "by-ingredients",
          ingredients: selectedIngredients.map((ing) => ing.name_en),
          userEmail,
          userName,
          recipeData: { additionalNotes },
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/request-recipe"), 3000);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-2xl border border-slate-100/80 max-w-md w-full"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Check className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3">
            {locale === "en" ? "Request Submitted!" : "অনুরোধ জমা হয়েছে!"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            {locale === "en"
              ? "We'll find the perfect recipes for your ingredients!"
              : "আমরা আপনার উপকরণের জন্য নিখুঁত রেসিপি খুঁজব!"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-4 sm:py-6 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 shadow-lg">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 px-2 leading-tight">
            {locale === "en"
              ? "Request Recipe by Ingredients"
              : "উপকরণ দিয়ে রেসিপি অনুরোধ করুন"}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm lg:text-base mt-1.5 sm:mt-2 px-3 sm:px-4 leading-relaxed">
            {locale === "en"
              ? "Select ingredients you have, and we'll suggest matching recipes"
              : "আপনার কাছে থাকা উপকরণ নির্বাচন করুন, আমরা মিলে যাওয়া রেসিপি সুপারিশ করব"}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Left Panel: Ingredient Selection */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-slate-100 p-3 sm:p-4 lg:p-6">
            <div className="mb-3 sm:mb-4 lg:mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    locale === "en"
                      ? "Search ingredients..."
                      : "উপকরণ খুঁজুন..."
                  }
                  className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm sm:text-base bg-slate-50 text-slate-700 font-medium"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-green-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 sm:max-h-[400px] overflow-y-auto pr-1">
                {Array.isArray(filteredIngredients) &&
                  filteredIngredients.map((ingredient) => {
                    const isSelected = selectedIngredients.some(
                      (ing) => ing.id === ingredient.id
                    );
                    return (
                      <button
                        key={ingredient.id}
                        onClick={() => toggleIngredient(ingredient)}
                        className={`p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left font-semibold shadow-sm hover:shadow-md active:scale-95 min-h-[44px] ${
                          isSelected
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700"
                            : "border-slate-200 hover:border-green-300 text-slate-700 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs sm:text-sm leading-snug line-clamp-2">
                            {locale === "en"
                              ? ingredient.name_en
                              : ingredient.name_bn}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Right Panel: Selected & Submit */}
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-slate-100 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 mb-2 sm:mb-3 lg:mb-4">
              {locale === "en" ? "Selected Ingredients" : "নির্বাচিত উপকরণ"}
            </h3>

            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 lg:mb-6 max-h-32 sm:max-h-40 lg:max-h-48 overflow-y-auto pr-1">
              {selectedIngredients.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  {locale === "en"
                    ? "No ingredients selected"
                    : "কোনো উপকরণ নির্বাচিত নেই"}
                </p>
              ) : (
                selectedIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200/50 shadow-sm"
                  >
                    <span className="text-sm font-semibold text-green-700">
                      {locale === "en" ? ing.name_en : ing.name_bn}
                    </span>
                    <button
                      onClick={() => toggleIngredient(ing)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 pt-3 sm:pt-4 lg:pt-6 space-y-2.5 sm:space-y-3 lg:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  {locale === "en"
                    ? "Your Name (Optional)"
                    : "আপনার নাম (ঐচ্ছিক)"}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                  placeholder={locale === "en" ? "Your name" : "আপনার নাম"}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  {locale === "en"
                    ? "Your Email (Optional)"
                    : "আপনার ইমেইল (ঐচ্ছিক)"}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  {locale === "en" ? "Additional Notes" : "অতিরিক্ত মন্তব্য"}
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm resize-none bg-slate-50 text-slate-700 font-medium transition-all"
                  placeholder={
                    locale === "en"
                      ? "Any preferences or dietary restrictions..."
                      : "কোনো পছন্দ বা খাদ্য বিধিনিষেধ..."
                  }
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedIngredients.length === 0 || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-bold text-sm hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {locale === "en" ? "Submitting..." : "জমা দেওয়া হচ্ছে..."}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="truncate">
                      {locale === "en"
                        ? `Request Recipe (${selectedIngredients.length})`
                        : `রেসিপি অনুরোধ (${selectedIngredients.length})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
