"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Youtube, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useLanguage from "@/hooks/useLanguage";

export default function RequestByNamePage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [requestType, setRequestType] = useState<"name" | "youtube">("name");
  const [recipeName, setRecipeName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/recipe-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "by-name",
          recipeName: requestType === "name" ? recipeName : undefined,
          youtubeUrl: requestType === "youtube" ? youtubeUrl : undefined,
          userEmail,
          userName,
          recipeData: { additionalNotes, requestSubType: requestType },
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-2xl border border-slate-100/80 max-w-md w-full"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Check className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3">
            {locale === "en" ? "Request Submitted!" : "অনুরোধ জমা হয়েছে!"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            {locale === "en"
              ? "We'll add this recipe to our collection soon!"
              : "আমরা শীঘ্রই এই রেসিপি আমাদের সংগ্রহে যোগ করব!"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Search className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 px-4">
            {locale === "en" ? "Request a Specific Recipe" : "নির্দিষ্ট রেসিপি অনুরোধ করুন"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 px-4">
            {locale === "en"
              ? "Tell us the recipe name or share a YouTube video"
              : "আমাদের রেসিপির নাম বলুন বা একটি ইউটিউব ভিডিও শেয়ার করুন"}
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100/80 p-4 sm:p-6 lg:p-8">
          {/* Request Type Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => setRequestType("name")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                requestType === "name"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">{locale === "en" ? "By Recipe Name" : "রেসিপির নাম দ্বারা"}</span>
              </div>
            </button>

            <button
              onClick={() => setRequestType("youtube")}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-95 ${
                requestType === "youtube"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">{locale === "en" ? "By YouTube Video" : "ইউটিউব ভিডিও দ্বারা"}</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Main Input */}
            {requestType === "name" ? (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en" ? "Recipe Name" : "রেসিপির নাম"}
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-base sm:text-lg bg-slate-50 text-slate-700 font-medium"
                  placeholder={
                    locale === "en"
                      ? "e.g., Chicken Biryani"
                      : "যেমন, চিকেন বিরিয়ানি"
                  }
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en" ? "YouTube Video URL" : "ইউটিউব ভিডিও URL"}
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all text-base sm:text-lg bg-slate-50 text-slate-700 font-medium"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-slate-500 mt-1 sm:mt-2">
                  {locale === "en"
                    ? "Paste the full YouTube video URL"
                    : "সম্পূর্ণ ইউটিউব ভিডিও URL পেস্ট করুন"}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                {locale === "en" ? "Additional Notes (Optional)" : "অতিরিক্ত মন্তব্য (ঐচ্ছিক)"}
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm sm:text-base bg-slate-50 text-slate-700 font-medium"
                placeholder={
                  locale === "en"
                    ? "Any specific variations or preferences..."
                    : "কোনো নির্দিষ্ট ভিন্নতা বা পছন্দ..."
                }
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en" ? "Your Name (Optional)" : "আপনার নাম (ঐচ্ছিক)"}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm sm:text-base bg-slate-50 text-slate-700 font-medium"
                  placeholder={locale === "en" ? "Your name" : "আপনার নাম"}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1 sm:mb-2">
                  {locale === "en" ? "Your Email (Optional)" : "আপনার ইমেইল (ঐচ্ছিক)"}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm sm:text-base bg-slate-50 text-slate-700 font-medium"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {locale === "en"
                    ? "We'll notify you when it's added"
                    : "যুক্ত হলে আমরা আপনাকে জানাব"}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm sm:text-base hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === "en" ? "Submitting..." : "জমা দেওয়া হচ্ছে..."}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {locale === "en" ? "Submit Request" : "অনুরোধ জমা দিন"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100/50 shadow-sm"
        >
          <h3 className="font-bold text-sm sm:text-base text-blue-900 mb-2 sm:mb-3">
            {locale === "en" ? "How it works" : "এটি কিভাবে কাজ করে"}
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>
                {locale === "en"
                  ? "Submit the recipe name or YouTube link"
                  : "রেসিপির নাম বা ইউটিউব লিঙ্ক জমা দিন"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>
                {locale === "en"
                  ? "Our team will review and create the recipe"
                  : "আমাদের দল পর্যালোচনা করে রেসিপি তৈরি করবে"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>
                {locale === "en"
                  ? "You'll be notified when it's available"
                  : "উপলব্ধ হলে আপনাকে জানানো হবে"}
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
