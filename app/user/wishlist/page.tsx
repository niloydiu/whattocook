"use client";

import React, { useEffect, useState } from "react";
import { useActiveUser } from "@/hooks/useActiveUser";
import { getUserWishlist, toggleWishlistIngredient } from "@/app/actions/user";
import { ShoppingCart, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
  const { user, loading: authLoading } = useActiveUser();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function loadWishlist() {
    if (!user) return;
    setLoading(true);
    const data = await getUserWishlist(user.id);
    setWishlist(data);
    setLoading(false);
  }

  async function handleRemove(item: any) {
    if (!user) return;
    const res = await toggleWishlistIngredient({
      userId: user.id,
      ingredientId: item.ingredientId,
      name_en: item.name_en,
    });

    if (res.success) {
      setWishlist((prev) => prev.filter((i) => i.id !== item.id));
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <ShoppingCart
            size={48}
            className="text-orange-600"
          />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 text-center">
          Sign in to see your wishlist
        </h1>
        <p className="text-slate-600 font-medium mb-8 text-center max-w-md">
          Keep track of ingredients you need for your favorite recipes.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Recipes
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center shadow-md">
            <ShoppingCart size={32} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-1">
              My Wishlist
            </h1>
            <p className="text-slate-600 font-medium">
              {wishlist.length} {wishlist.length === 1 ? 'ingredient' : 'ingredients'} needed
            </p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100/80 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-slate-600 font-medium mb-6">
              Add ingredients from any recipe page!
            </p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg border border-slate-100/80 transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {item.ingredient?.img ? (
                      <img
                        src={item.ingredient.img}
                        alt={item.name_en}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-50 shadow-sm group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
                        <ShoppingCart size={24} className="text-orange-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">
                        {item.name_en}
                      </h3>
                      {item.name_bn && (
                        <p className="text-sm text-slate-500 font-medium">
                          {item.name_bn}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95 ml-4"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={20} />
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
