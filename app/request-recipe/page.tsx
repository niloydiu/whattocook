"use client";

import { motion } from "framer-motion";
import { ChefHat, Utensils, Youtube, ClipboardList } from "lucide-react";
import Link from "next/link";
import useLanguage from "@/hooks/useLanguage";

export default function RequestRecipePage() {
  const { locale } = useLanguage();

  const requestTypes = [
    {
      icon: ClipboardList,
      title: locale === "en" ? "Submit Your Recipe" : "আপনার রেসিপি জমা দিন",
      description:
        locale === "en"
          ? "Share your favorite recipe with our community. Step-by-step guide to submit your culinary creation."
          : "আপনার প্রিয় রেসিপি আমাদের সাথে শেয়ার করুন। ধাপে ধাপে আপনার রান্নার সৃষ্টি জমা দিন।",
      href: "/request-recipe/submit",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Utensils,
      title:
        locale === "en"
          ? "Request by Ingredients"
          : "উপকরণ দিয়ে রেসিপি চাই",
      description:
        locale === "en"
          ? "Have ingredients but don't know what to cook? Tell us what you have and we'll find or create a recipe for you."
          : "উপকরণ আছে কিন্তু কী রান্না করবেন জানেন না? আমাদের জানান এবং আমরা আপনার জন্য রেসিপি খুঁজে দেব।",
      href: "/request-recipe/by-ingredients",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Youtube,
      title:
        locale === "en" ? "Request by Name/Video" : "নাম বা ভিডিও দিয়ে চাই",
      description:
        locale === "en"
          ? "Know a recipe name or have a YouTube video? Request us to add it to our collection."
          : "কোনো রেসিপির নাম জানেন বা ইউটিউব ভিডিও আছে? আমাদের জানান এবং আমরা এটি যোগ করব।",
      href: "/request-recipe/by-name",
      color: "from-blue-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6 shadow-lg shadow-red-600/30">
            <ChefHat size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {locale === "en" ? "Request a Recipe" : "রেসিপি অনুরোধ করুন"}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            {locale === "en"
              ? "Can't find what you're looking for? Submit a recipe, request one based on your ingredients, or tell us what you'd like to see."
              : "যা খুঁজছেন তা পাচ্ছেন না? একটি রেসিপি জমা দিন, আপনার উপকরণ দিয়ে একটি চাই, অথবা আপনি কী দেখতে চান তা আমাদের জানান।"}
          </p>
        </motion.div>

        {/* Request Type Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {requestTypes.map((type, index) => (
            <motion.div
              key={type.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={type.href}>
                <div className="group relative h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <type.icon size={32} className="text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-black text-slate-900 mb-3">
                    {type.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {type.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-6 flex items-center text-red-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                    <span>
                      {locale === "en" ? "Get Started" : "শুরু করুন"}
                    </span>
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-4">
            {locale === "en" ? "How It Works" : "এটি কীভাবে কাজ করে"}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                {locale === "en" ? "Submit Request" : "অনুরোধ জমা দিন"}
              </h3>
              <p className="text-slate-600 text-sm">
                {locale === "en"
                  ? "Choose your request type and fill in the details"
                  : "আপনার অনুরোধের ধরন বেছে নিন এবং বিবরণ পূরণ করুন"}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                {locale === "en" ? "We Review" : "আমরা পর্যালোচনা করি"}
              </h3>
              <p className="text-slate-600 text-sm">
                {locale === "en"
                  ? "Our team reviews your request and works on it"
                  : "আমাদের টিম আপনার অনুরোধ পর্যালোচনা করে এবং কাজ করে"}
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                {locale === "en" ? "Recipe Added" : "রেসিপি যোগ করা হয়"}
              </h3>
              <p className="text-slate-600 text-sm">
                {locale === "en"
                  ? "Your recipe becomes available to everyone"
                  : "আপনার রেসিপি সবার জন্য উপলব্ধ হয়ে যায়"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
