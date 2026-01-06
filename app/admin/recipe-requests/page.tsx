"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Utensils,
  Youtube,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

type RecipeRequest = {
  id: number;
  requestType: string;
  status: string;
  title: string;
  recipeName?: string;
  youtubeUrl?: string;
  ingredients?: string[];
  recipeData?: any;
  userName?: string;
  userEmail?: string;
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
};

export default function RecipeRequestsPage() {
  const { locale } = useLanguage();
  const [requests, setRequests] = useState<RecipeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/recipe-requests");
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    id: number,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/recipe-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "submit":
        return <ClipboardList size={20} />;
      case "by-ingredients":
        return <Utensils size={20} />;
      case "by-name":
        return <Youtube size={20} />;
      default:
        return <ClipboardList size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "submit":
        return "from-red-500 to-orange-500";
      case "by-ingredients":
        return "from-green-500 to-teal-500";
      case "by-name":
        return "from-blue-500 to-purple-500";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    if (filterType !== "all" && req.requestType !== filterType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {locale === "en" ? "Recipe Requests" : "রেসিপি অনুরোধ"}
          </h1>
          <p className="text-slate-600">
            {locale === "en"
              ? "Manage user recipe requests and submissions"
              : "ব্যবহারকারীর রেসিপি অনুরোধ এবং জমা পরিচালনা করুন"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {locale === "en" ? "Status" : "অবস্থা"}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none font-medium"
              >
                <option value="all">{locale === "en" ? "All" : "সব"}</option>
                <option value="pending">{locale === "en" ? "Pending" : "অপেক্ষমাণ"}</option>
                <option value="approved">{locale === "en" ? "Approved" : "অনুমোদিত"}</option>
                <option value="rejected">{locale === "en" ? "Rejected" : "প্রত্যাখ্যাত"}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {locale === "en" ? "Type" : "ধরন"}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none font-medium"
              >
                <option value="all">{locale === "en" ? "All" : "সব"}</option>
                <option value="submit">{locale === "en" ? "Submitted" : "জমা দেওয়া"}</option>
                <option value="by-ingredients">
                  {locale === "en" ? "By Ingredients" : "উপকরণ দ্বারা"}
                </option>
                <option value="by-name">
                  {locale === "en" ? "By Name/Video" : "নাম/ভিডিও দ্বারা"}
                </option>
              </select>
            </div>

            <div className="flex-1 flex items-end justify-end">
              <div className="text-sm font-bold text-slate-600">
                {filteredRequests.length}{" "}
                {locale === "en" ? "requests" : "অনুরোধ"}
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center">
              <p className="text-slate-400 text-lg">
                {locale === "en" ? "No requests found" : "কোনো অনুরোধ পাওয়া যায়নি"}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                layout
                className="bg-white rounded-3xl shadow-lg overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() =>
                    setExpandedRequest(expandedRequest === request.id ? null : request.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(
                          request.requestType
                        )} flex items-center justify-center text-white flex-shrink-0`}
                      >
                        {getTypeIcon(request.requestType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-slate-900 truncate">
                            {request.title || request.recipeName || "Recipe Request"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                          {request.userName && (
                            <div className="flex items-center gap-1.5">
                              <User size={14} />
                              <span>{request.userName}</span>
                            </div>
                          )}
                          {request.userEmail && (
                            <div className="flex items-center gap-1.5">
                              <Mail size={14} />
                              <span className="truncate max-w-xs">{request.userEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {request.status === "pending" && processingId !== request.id && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateRequestStatus(request.id, "approved");
                            }}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Approve"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateRequestStatus(request.id, "rejected");
                            }}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <X size={20} />
                          </button>
                        </>
                      )}
                      {processingId === request.id && (
                        <Loader2 size={20} className="animate-spin text-slate-400" />
                      )}
                      {expandedRequest === request.id ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedRequest === request.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 overflow-hidden"
                    >
                      <div className="p-6 bg-slate-50">
                        {/* Recipe Details */}
                        {request.requestType === "submit" && request.recipeData && (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-bold text-slate-700">Cuisine:</span>{" "}
                                {request.recipeData.cuisine}
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Category:</span>{" "}
                                {request.recipeData.category}
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Difficulty:</span>{" "}
                                {request.recipeData.difficulty}
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Time:</span>{" "}
                                {request.recipeData.prep_time + request.recipeData.cook_time} min
                              </div>
                            </div>

                            {request.recipeData.ingredients && (
                              <div>
                                <h4 className="font-bold text-slate-900 mb-2">Ingredients:</h4>
                                <div className="bg-white rounded-xl p-4 max-h-48 overflow-y-auto">
                                  <ul className="space-y-1 text-sm">
                                    {request.recipeData.ingredients.map(
                                      (ing: any, idx: number) => (
                                        <li key={idx} className="text-slate-700">
                                          {ing.quantity} {ing.unit_en} {ing.name_en}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {request.requestType === "by-ingredients" && request.ingredients && (
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2">Ingredients:</h4>
                            <div className="flex flex-wrap gap-2">
                              {request.ingredients.map((ing, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.requestType === "by-name" && (
                          <div className="space-y-2 text-sm">
                            {request.recipeName && (
                              <div>
                                <span className="font-bold text-slate-700">Recipe Name:</span>{" "}
                                {request.recipeName}
                              </div>
                            )}
                            {request.youtubeUrl && (
                              <div>
                                <span className="font-bold text-slate-700">YouTube URL:</span>{" "}
                                <a
                                  href={request.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {request.youtubeUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Additional Notes */}
                        {request.recipeData?.additionalNotes && (
                          <div className="mt-4">
                            <h4 className="font-bold text-slate-900 mb-2">Additional Notes:</h4>
                            <p className="text-sm text-slate-700 bg-white rounded-xl p-4">
                              {request.recipeData.additionalNotes}
                            </p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {request.adminNotes && (
                          <div className="mt-4">
                            <h4 className="font-bold text-slate-900 mb-2">Admin Notes:</h4>
                            <p className="text-sm text-slate-700 bg-yellow-50 rounded-xl p-4">
                              {request.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
