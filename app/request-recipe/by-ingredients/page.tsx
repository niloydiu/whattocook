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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <ChefHat className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 px-4">
            {locale === "en"
              ? "Request Recipe by Ingredients"
              : "উপকরণ দিয়ে রেসিপি অনুরোধ করুন"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-2 px-4">
            {locale === "en"
              ? "Select ingredients you have, and we'll suggest matching recipes"
              : "আপনার কাছে থাকা উপকরণ নির্বাচন করুন, আমরা মিলে যাওয়া রেসিপি সুপারিশ করব"}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel: Ingredient Selection */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100/80 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
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
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-base sm:text-lg bg-slate-50 text-slate-700 font-medium"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={36} className="sm:w-10 sm:h-10 animate-spin text-green-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
                {Array.isArray(filteredIngredients) &&
                  filteredIngredients.map((ingredient) => {
                    const isSelected = selectedIngredients.some(
                      (ing) => ing.id === ingredient.id
                    );
                    return (
                      <button
                        key={ingredient.id}
                        onClick={() => toggleIngredient(ingredient)}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left font-semibold shadow-sm hover:shadow-md active:scale-95 ${
                          isSelected
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700"
                            : "border-slate-200 hover:border-green-300 text-slate-700 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm leading-tight">
                            {locale === "en"
                              ? ingredient.name_en
                              : ingredient.name_bn}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 ml-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Right Panel: Selected & Submit */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100/80 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3 sm:mb-4">
              {locale === "en" ? "Selected Ingredients" : "নির্বাচিত উপকরণ"}
            </h3>

            <div className="space-y-2 mb-4 sm:mb-6 max-h-40 sm:max-h-48 overflow-y-auto">
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

            <div className="border-t border-slate-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en"
                    ? "Your Name (Optional)"
                    : "আপনার নাম (ঐচ্ছিক)"}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-xs sm:text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                  placeholder={locale === "en" ? "Your name" : "আপনার নাম"}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en"
                    ? "Your Email (Optional)"
                    : "আপনার ইমেইল (ঐচ্ছিক)"}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-xs sm:text-sm bg-slate-50 text-slate-700 font-medium transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en" ? "Additional Notes" : "অতিরিক্ত মন্তব্য"}
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-xs sm:text-sm resize-none bg-slate-50 text-slate-700 font-medium transition-all"
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
                className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold text-sm sm:text-base hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
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
