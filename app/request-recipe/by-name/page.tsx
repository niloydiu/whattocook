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
          className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            {locale === "en" ? "Request Submitted!" : "অনুরোধ জমা হয়েছে!"}
          </h2>
          <p className="text-slate-600">
            {locale === "en"
              ? "We'll add this recipe to our collection soon!"
              : "আমরা শীঘ্রই এই রেসিপি আমাদের সংগ্রহে যোগ করব!"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {locale === "en" ? "Request a Specific Recipe" : "নির্দিষ্ট রেসিপি অনুরোধ করুন"}
          </h1>
          <p className="text-slate-600 text-lg">
            {locale === "en"
              ? "Tell us the recipe name or share a YouTube video"
              : "আমাদের রেসিপির নাম বলুন বা একটি ইউটিউব ভিডিও শেয়ার করুন"}
          </p>
        </motion.div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Request Type Toggle */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRequestType("name")}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
                requestType === "name"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Search size={20} />
                {locale === "en" ? "By Recipe Name" : "রেসিপির নাম দ্বারা"}
              </div>
            </button>

            <button
              onClick={() => setRequestType("youtube")}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
                requestType === "youtube"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Youtube size={20} />
                {locale === "en" ? "By YouTube Video" : "ইউটিউব ভিডিও দ্বারা"}
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Input */}
            {requestType === "name" ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {locale === "en" ? "Recipe Name" : "রেসিপির নাম"}
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  required
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-lg"
                  placeholder={
                    locale === "en"
                      ? "e.g., Chicken Biryani, Prawn Malai Curry"
                      : "যেমন, চিকেন বিরিয়ানি, চিংড়ি মালাইকারি"
                  }
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {locale === "en" ? "YouTube Video URL" : "ইউটিউব ভিডিও URL"}
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none transition-colors text-lg"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-slate-500 mt-2">
                  {locale === "en"
                    ? "Paste the full YouTube video URL"
                    : "সম্পূর্ণ ইউটিউব ভিডিও URL পেস্ট করুন"}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {locale === "en" ? "Additional Notes (Optional)" : "অতিরিক্ত মন্তব্য (ঐচ্ছিক)"}
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                placeholder={
                  locale === "en"
                    ? "Any specific variations or preferences..."
                    : "কোনো নির্দিষ্ট ভিন্নতা বা পছন্দ..."
                }
              />
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {locale === "en" ? "Your Name (Optional)" : "আপনার নাম (ঐচ্ছিক)"}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder={locale === "en" ? "Your name" : "আপনার নাম"}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {locale === "en" ? "Your Email (Optional)" : "আপনার ইমেইল (ঐচ্ছিক)"}
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-slate-500 mt-2">
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
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {locale === "en" ? "Submitting..." : "জমা দেওয়া হচ্ছে..."}
                </>
              ) : (
                <>
                  <Check size={20} />
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
          className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h3 className="font-bold text-blue-900 mb-2">
            {locale === "en" ? "How it works" : "এটি কিভাবে কাজ করে"}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
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
