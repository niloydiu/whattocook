"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useLanguage from "@/hooks/useLanguage";
import supabase from "@/lib/supabaseClient";
import {
  MessageSquare,
  Send,
  X,
  Loader2,
  Bot,
  User,
  ChefHat,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API_PATHS } from "@/lib/api-paths";
import { useGlobalScrollCapture } from "./ScrollCaptureProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatBot() {
  const { locale: language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  const lastSavedCountRef = useRef<number>(0);

  // Use global scroll capture for intelligent scroll behavior
  const messagesRef = useGlobalScrollCapture(
    "chatbot-messages",
    10
  ) as React.RefObject<HTMLDivElement>;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesRef.current && messages.length > 0) {
      const container = messagesRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      // Only auto-scroll if user is near the bottom or it's a new message
      if (isNearBottom || messages.length === 1) {
        setTimeout(() => {
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [messages]);

  const STORAGE_KEY = "wtc_chat_messages_v1";
  const OPEN_KEY = "wtc_chat_open_v1";

  // Load persisted session chat and open state
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        setMessages(parsed);
      }
      const open = sessionStorage.getItem(OPEN_KEY);
      if (open === "1") setIsOpen(true);
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist messages and open state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem(OPEN_KEY, isOpen ? "1" : "0");
    } catch (e) {}
  }, [isOpen]);

  // Supabase auth state (for Google sign-in)
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser((data as any)?.session?.user ?? null);
      } catch (e) {
        // ignore
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      try {
        sub.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  // When user logs in, load saved history from backend
  useEffect(() => {
    if (!user || !user.id) return;
    (async () => {
      try {
        // get access token for authorization
        const sessionResp = await supabase.auth.getSession();
        const token = (sessionResp as any)?.data?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(API_PATHS.CHAT_HISTORY, { headers });
        const data = await res.json();
        if (!data.error && Array.isArray(data.messages)) {
          setMessages(data.messages);
          // initialize lastSavedCount so we send only deltas later
          lastSavedCountRef.current = data.messages.length;
        }
      } catch (e) {
        console.warn("Failed to load chat history:", e);
      }
    })();
  }, [user]);

  // Save history (debounced) when messages change and user is logged in
  useEffect(() => {
    if (!user || !user.id) return;
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        // send only new messages since last saved count
        const last = lastSavedCountRef.current || 0;
        const newMessages = messages.slice(last);
        if (newMessages.length === 0) return;

        const sessionResp = await supabase.auth.getSession();
        const token = (sessionResp as any)?.data?.session?.access_token;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(API_PATHS.CHAT_HISTORY, {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: newMessages, delta: true }),
        });

        const data = await res.json();
        if (!data.error) {
          // assume append succeeded — update lastSavedCount
          lastSavedCountRef.current = messages.length;
        }
      } catch (e) {
        console.warn("Failed to save chat history:", e);
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [messages, user]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSignIn = async () => {
    if (!supabase) {
      alert(
        language === "en"
          ? "Supabase not configured"
          : "Supabase কনফিগার করা নেই"
      );
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user" as const,
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_PATHS.CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language,
        }),
      });

      const data = await response.json();
      if (data.error) {
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              language === "en" ? `Error: ${errMsg}` : `ত্রুটি: ${errMsg}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errStr = error instanceof Error ? error.message : String(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            language === "en"
              ? `Failed to connect: ${errStr}`
              : `সংযুক্ত হতে ব্যর্থ: ${errStr}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[150] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mb-4 w-80 sm:w-96 max-w-[calc(100vw-2rem)] min-h-[400px] h-[500px] max-h-[70vh] bg-white/95 rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100/80 overflow-hidden backdrop-blur-xl hover:shadow-3xl transition-shadow duration-300 flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-orange-600 p-4 flex justify-between items-center text-white shadow-lg z-10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">
                    {language === "en"
                      ? "Kitchen Assistant"
                      : "রান্নাঘরের সহকারী"}
                  </h3>
                  <p className="text-[10px] text-orange-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                    <span className="truncate">{language === "en" ? "Online" : "অনলাইন"}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {user ? (
                  <div className="text-[10px] text-white/80 bg-white/10 px-2 py-1 rounded-md hidden sm:block max-w-[100px] truncate border border-white/5">
                    {user.email}
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                  >
                    {language === "en" ? "Sign in" : "সাইন ইন"}
                  </button>
                )}
                <button
                  onClick={toggleChat}
                  className="hover:bg-white/20 p-1.5 rounded-full transition-all active:scale-95 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 min-h-0 p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 transition-colors"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(203 213 225) transparent',
                scrollbarGutter: 'stable'
              }}
            >
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center py-12 px-6"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 via-orange-50 to-yellow-50 rounded-3xl flex items-center justify-center mx-auto shadow-lg border border-white/50">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                        <ChefHat className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {language === "en"
                      ? "Hi! I'm your cooking assistant."
                      : "হ্যালো! আমি আপনার রান্নার সহকারী।"}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto px-4">
                    {language === "en"
                      ? "Ask me for recipes, ingredient substitutes, or tell me what's in your kitchen!"
                      : "আমাকে রেসিপি জিজ্ঞাসা করুন, বিকল্প উপকরণ খুঁজুন, অথবা আপনার কাছে কি আছে তা জানান!"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() =>
                        setInput(
                          language === "en"
                            ? "What's for dinner?"
                            : "রাতের খাবার কি?"
                        )
                      }
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full transition-colors"
                    >
                      {language === "en"
                        ? "What's for dinner?"
                        : "রাতের খাবার কি?"}
                    </button>
                    <button
                      onClick={() =>
                        setInput(
                          language === "en"
                            ? "I have chicken and rice"
                            : "আমার কাছে মুরগি ও ভাত আছে"
                        )
                      }
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full transition-colors"
                    >
                      {language === "en"
                        ? "I have chicken and rice"
                        : "মুরগি ও ভাত আছে"}
                    </button>
                  </div>
                </motion.div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`flex gap-3 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 ${
                      m.role === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-red-500 to-orange-500"
                          : "bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <ChefHat className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl relative group transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-red-500 via-red-600 to-orange-500 text-white rounded-tr-sm shadow-lg shadow-red-500/25 backdrop-blur-sm"
                          : "bg-white border border-slate-200/60 rounded-tl-sm shadow-md hover:shadow-lg backdrop-blur-sm"
                      }`}
                    >
                      {/* Message Content */}
                      <div
                        className={`text-sm leading-relaxed font-medium break-words overflow-wrap-anywhere ${
                          m.role === "user" ? "text-white" : "text-slate-800"
                        }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                className={`underline font-semibold hover:opacity-80 transition-opacity ${
                                  m.role === "user"
                                    ? "text-orange-100"
                                    : "text-orange-600"
                                }`}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                {...props}
                                className="list-disc ml-4 my-2 space-y-1"
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                {...props}
                                className="list-decimal ml-4 my-2 space-y-1"
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li {...props} className="leading-relaxed" />
                            ),
                            p: ({ node, ...props }) => (
                              <p
                                {...props}
                                className="mb-2 last:mb-0 leading-relaxed"
                              />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong
                                {...props}
                                className={`font-bold ${
                                  m.role === "user"
                                    ? "text-orange-100"
                                    : "text-slate-900"
                                }`}
                              />
                            ),
                            code: ({ node, ...props }: any) => {
                              const isInline =
                                !props.className?.includes("language-");
                              return isInline ? (
                                <code
                                  {...props}
                                  className={`px-2 py-1 rounded-md text-xs font-mono font-semibold ${
                                    m.role === "user"
                                      ? "bg-white/25 text-orange-100 border border-white/20"
                                      : "bg-slate-100 text-slate-800 border border-slate-200"
                                  }`}
                                />
                              ) : (
                                <code
                                  {...props}
                                  className={`block p-3 rounded-lg text-xs font-mono overflow-x-auto border ${
                                    m.role === "user"
                                      ? "bg-white/25 text-orange-100 border-white/20"
                                      : "bg-slate-100 text-slate-800 border-slate-200"
                                  }`}
                                />
                              );
                            },
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                {...props}
                                className={`border-l-4 pl-4 my-2 italic font-medium ${
                                  m.role === "user"
                                    ? "border-white/40 text-orange-100"
                                    : "border-slate-300 text-slate-600"
                                }`}
                              />
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>

                      {/* Message Tail */}
                      <div
                        className={`absolute bottom-0 w-4 h-4 ${
                          m.role === "user"
                            ? "-right-1 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-bl-lg"
                            : "-left-1 bg-white border-l border-b border-slate-200/60 rounded-br-lg"
                        }`}
                      />
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] px-2 font-medium opacity-70 ${
                        m.role === "user"
                          ? "text-right text-red-600"
                          : "text-left text-slate-500"
                      }`}
                    >
                      {m.timestamp || new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="flex gap-3 justify-start"
                >
                  {/* Assistant Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <ChefHat className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>

                  {/* Loading Bubble */}
                  <div className="flex flex-col gap-1 items-start">
                    <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md hover:shadow-lg transition-shadow duration-200 relative backdrop-blur-sm">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="w-2 h-2 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        />
                      </div>
                      {/* Message Tail */}
                      <div className="absolute bottom-0 -left-1 w-4 h-4 bg-white border-l border-b border-slate-200/60 rounded-br-lg shadow-sm" />
                    </div>
                    <div className="text-xs text-slate-500 px-2 text-left font-medium">
                      Typing...
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200/80">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      language === "en"
                        ? "Type your message..."
                        : "আপনার বার্তা লিখুন..."
                    }
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 focus:shadow-lg transition-all duration-200 shadow-sm hover:shadow-md hover:border-slate-300"
                  />
                  {input.trim() && (
                    <motion.button
                      type="button"
                      onClick={() => setInput("")}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
                  whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                  className={`p-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none ${
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white hover:shadow-red-500/25"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1, rotate: isOpen ? 180 : 0 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 flex items-center justify-center group border-2 border-white/20 backdrop-blur-sm z-[151] pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <motion.span
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
