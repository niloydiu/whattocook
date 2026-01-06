"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  X,
  CheckCircle2,
  Circle,
  ListTodo,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import AlertModal from "@/components/AlertModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useActiveUser } from "@/hooks/useActiveUser";
import useLanguage from "@/hooks/useLanguage";
import {
  getActiveCookingProgress,
  updateStepProgress,
  finishCooking,
  deleteCookingProgress,
  updateIngredientProgress,
} from "@/app/actions/user";

export default function CookingTracker() {
  const { user } = useActiveUser();
  const { locale } = useLanguage();
  const t = locale === "en";
  const [isOpen, setIsOpen] = useState(false);
  const [activeRecipes, setActiveRecipes] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error",
  });
  const [confirm, setConfirm] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: (() => {}) as () => void,
  });

  // Fetch active cooking progress when user is logged in
  useEffect(() => {
    if (user) {
      refreshProgress();
    } else {
      setActiveRecipes([]);
    }
  }, [user]);

  async function refreshProgress() {
    if (!user) return;
    const userId = user.id || user.email; // Fallback for dev mode
    const data = await getActiveCookingProgress(userId);
    setActiveRecipes(data || []);
    if (data && data.length > 0 && selectedIndex >= data.length) {
      setSelectedIndex(0);
    }
  }

  // Poll for changes or use a custom event? For now periodic refresh or on mount
  useEffect(() => {
    const handleRefresh = () => refreshProgress();
    window.addEventListener("refreshCookingProgress", handleRefresh);
    return () =>
      window.removeEventListener("refreshCookingProgress", handleRefresh);
  }, [user]);

  if (!user || activeRecipes.length === 0) return null;

  const currentRecipe = activeRecipes[selectedIndex];

  return (
    <>
      {/* Floating Messenger-style Bubble */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
      >
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:from-red-700 hover:to-orange-700 transition-all group overflow-hidden border-4 border-white hover:scale-110 active:scale-95"
          >
            <ChefHat
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-12 scale-110" : ""
              }`}
              size={28}
            />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Badge for multiple recipes */}
            {activeRecipes.length > 1 && (
              <div className="absolute -top-1 -right-1 bg-red-600">
                {activeRecipes.length}
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100/80 w-full max-w-2xl h-[85vh] sm:h-[75vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-red-50/50 to-orange-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center shadow-sm">
                      <ChefHat size={24} className="text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">
                        Cooking Mode
                      </h2>
                      <p className="text-sm text-slate-600 font-medium">
                        Tracking your progress
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/80 rounded-xl transition-all active:scale-95"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                {/* Recipe Selection (Tabs if multiple) */}
                {activeRecipes.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hidden">
                    {activeRecipes.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedIndex(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2 shadow-sm hover:shadow-md active:scale-95 ${
                          selectedIndex === idx
                            ? "bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-600 shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-slate-50"
                        }`}
                      >
                        {item.recipe.title_en}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {currentRecipe && (
                  <>
                    {/* Header Summary */}
                    <div className="flex items-start gap-4">
                      <img
                        src={currentRecipe.recipe.image}
                        className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                        alt=""
                      />
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {currentRecipe.recipe.title_en}
                        </h3>
                        <p className="text-sm text-slate-500 capitalize">
                          {currentRecipe.recipe.cuisine} •{" "}
                          {currentRecipe.recipe.category}
                        </p>
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => setShowProgress(!showProgress)}
                            className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
                          >
                            {showProgress ? (
                              <ShoppingCart size={14} />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            {showProgress ? "View Ingredients" : "View Steps"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {!showProgress ? (
                      /* Ingredients Checklist */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">
                            <ShoppingCart size={18} className="text-red-600" />
                            Ingredients Checklist
                          </h4>
                        </div>
                        <div className="grid gap-2">
                          {currentRecipe.recipe.ingredients.map((ing: any) => (
                            <label
                              key={ing.id}
                              className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded-lg accent-red-600"
                              />
                              <span className="text-sm font-medium text-slate-700">
                                {ing.quantity} {ing.unit_en}{" "}
                                {ing.ingredient.name_en}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Checklist */
                      <div className="space-y-8">
                        {/* Ingredients Checklist */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-slate-900">
                            <ShoppingCart
                              size={18}
                              className="text-orange-600"
                            />
                              {t ? "Ingredients Check" : "উপকরণ যাচাই"}
                            </h4>
                            <span className="text-[10px] bg-orange-100">
                              {currentRecipe.ingredientProgress?.filter(
                                (i: any) => i.isHave
                              ).length || 0}{" "}
                              / {currentRecipe.recipe.ingredients.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentRecipe.recipe.ingredients.map(
                              (item: any) => {
                                const isHave =
                                  currentRecipe.ingredientProgress?.find(
                                    (p: any) =>
                                      p.ingredientId === item.ingredient.id
                                  )?.isHave;
                                return (
                                  <button
                                    key={item.ingredient.id}
                                    onClick={async () => {
                                      await updateIngredientProgress(
                                        currentRecipe.id,
                                        item.ingredient.id,
                                        !isHave
                                      );
                                      refreshProgress();
                                    }}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left shadow-sm hover:shadow-md active:scale-95 ${
                                      isHave
                                        ? "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-800"
                                        : "bg-white border-slate-200 hover:border-orange-200"
                                    }`}
                                  >
                                    <div
                                      className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 shadow-sm ${
                                        isHave
                                          ? "bg-gradient-to-r from-orange-600 to-amber-600 border-orange-600 text-white"
                                          : "border-slate-300 bg-white"
                                      }`}
                                    >
                                      {isHave && <CheckCircle2 size={14} />}
                                    </div>
                                    <span className="text-xs font-bold truncate">
                                      {t
                                        ? item.ingredient.name_en
                                        : item.ingredient.name_bn}
                                    </span>
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* Steps Checklist */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">
                              <ListTodo size={18} className="text-red-600" />
                              {t ? "Step-by-Step Guide" : "ধাপে ধাপে নির্দেশনা"}
                            </h4>
                            <span className="text-[10px] bg-slate-100">
                              {
                                currentRecipe.stepProgress.filter(
                                  (s: any) => s.isCompleted
                                ).length
                              }{" "}
                              / {currentRecipe.recipe.steps.length}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {currentRecipe.recipe.steps.map((step: any) => {
                              const isDone = currentRecipe.stepProgress.find(
                                (s: any) => s.stepNumber === step.step_number
                              )?.isCompleted;
                              return (
                                <button
                                  key={step.id}
                                  onClick={async () => {
                                    await updateStepProgress(
                                      currentRecipe.id,
                                      step.step_number,
                                      !isDone
                                    );
                                    refreshProgress();
                                  }}
                                  className={`w-full text-left p-5 rounded-3xl transition-all border-2 shadow-sm hover:shadow-md active:scale-95 ${
                                    isDone
                                      ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-900"
                                      : "bg-white border-slate-200 hover:border-red-200"
                                  }`}
                                >
                                  <div className="flex gap-4">
                                    <div
                                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${
                                        isDone
                                          ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                                          : "bg-slate-100 text-slate-600 border-2 border-slate-200"
                                      }`}
                                    >
                                      {isDone ? (
                                        <CheckCircle2 size={16} />
                                      ) : (
                                        step.step_number
                                      )}
                                    </div>
                                    <p
                                      className={`text-sm leading-relaxed font-medium ${
                                        isDone ? "line-through opacity-70" : ""
                                      }`}
                                    >
                                      {t
                                        ? step.instruction_en
                                        : step.instruction_bn}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100">
                <button
                  onClick={async () => {
                    setConfirm({
                      isOpen: true,
                      title: t ? "Stop cooking?" : "রান্না বন্ধ করবেন?",
                      message: t
                        ? "Stop cooking this recipe? Your progress will be deleted."
                        : "এই রেসিপির রান্না বন্ধ করবেন? আপনার অগ্রগতি মুছে ফেলা হবে।",
                      onConfirm: async () => {
                        await deleteCookingProgress(currentRecipe.id);
                        refreshProgress();
                        setConfirm((s) => ({ ...s, isOpen: false }));
                      },
                    });
                  }}
                  className="flex-1 py-4 bg-white"
                >
                  <Trash2 size={18} />
                  Stop Cooking
                </button>
                <button
                  onClick={async () => {
                    await finishCooking(currentRecipe.id);
                    setAlert({
                      isOpen: true,
                      title: t ? "Well done!" : "অভিনন্দন!",
                      message: t
                        ? "Congratulations on finishing the dish!"
                        : "রান্না শেষ করার জন্য অভিনন্দন!",
                      type: "success",
                    });
                    refreshProgress();
                  }}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Complete Dish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert((s) => ({ ...s, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
      <ConfirmModal
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        onConfirm={() => {
          confirm.onConfirm();
        }}
        onCancel={() => setConfirm((s) => ({ ...s, isOpen: false }))}
      />
    </>
  );
}
