"use client";

import { useState, useRef, useEffect } from "react";
import useLanguage from "@/hooks/useLanguage";
import supabase from "@/lib/supabaseClient";
import { MessageSquare, Send, X, Loader2, Bot, User, ChefHat } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
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

  const STORAGE_KEY = "wtc_chat_messages_v1";
  const OPEN_KEY = "wtc_chat_open_v1";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
    });

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

        const res = await fetch(`/api/chat/history`, { headers });
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

        const res = await fetch(`/api/chat/history`, {
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
      alert(language === "en" ? "Supabase not configured" : "Supabase কনফিগার করা নেই");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language,
        }),
      });

      const data = await response.json();
      if (data.error) {
        const errMsg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: language === "en" ? `Error: ${errMsg}` : `ত্রুটি: ${errMsg}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errStr = error instanceof Error ? error.message : String(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: language === "en" ? `Failed to connect: ${errStr}` : `সংযুক্ত হতে ব্যর্থ: ${errStr}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {language === "en" ? "Kitchen Assistant" : "রান্নাঘরের সহকারী"}
                </h3>
                <p className="text-[10px] text-orange-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  {language === "en" ? "Online" : "অনলাইন"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="text-xs text-white mr-2">{user.email}</div>
              ) : (
                <button onClick={handleSignIn} className="bg-white/20 text-white px-3 py-1 rounded-md text-xs mr-2">
                  {language === "en" ? "Sign in with Google" : "Google দিয়ে সাইন ইন"}
                </button>
              )}
              {user && (
                <button onClick={handleSignOut} className="bg-white/20 text-white px-3 py-1 rounded-md text-xs mr-2">
                  {language === "en" ? "Sign out" : "সাইন আউট"}
                </button>
              )}
              <button
                onClick={toggleChat}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
          >
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {language === "en" ? "Hi! I'm your cooking assistant." : "হ্যালো! আমি আপনার রান্নার সহকারী।"}
                </p>
                <p className="text-xs text-gray-500 mt-1 px-4">
                  {language === "en" 
                    ? "Ask me for recipes, ingredient substitutes, or tell me what's in your kitchen!" 
                    : "আমাকে রেসিপি জিজ্ঞাসা করুন, বিকল্প উপকরণ খুঁজুন, অথবা আপনার কাছে কি আছে তা জানান!"}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    m.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({node, ...props}) => <a {...props} className="text-orange-600 underline font-semibold hover:text-orange-700" />,
                      ul: ({node, ...props}) => <ul {...props} className="list-disc ml-4 my-2" />,
                      ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-4 my-2" />,
                      p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm space-x-1 flex items-center">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-4 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === "en" ? "Type your message..." : "আপনার বার্তা লিখুন..."
              }
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-black"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleChat}
        className={`${
          isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-orange-500 hover:bg-orange-600"
        } text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-orange-500 rounded-full animate-ping"></span>
          </div>
        )}
      </button>
    </div>
  );
}
