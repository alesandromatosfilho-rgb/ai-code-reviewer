"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { ReviewPanel } from "@/components/ReviewPanel";
import { HistoryList } from "@/components/HistoryList";
import { Code2, LogOut, Loader2, Sparkles, History } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Review, ReviewFeedback, ReviewFocus, CodeLanguage } from "@/types";
import clsx from "clsx";

const languages: { value: CodeLanguage; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const focuses: { value: ReviewFocus; label: string; description: string }[] = [
  { value: "geral", label: "Geral", description: "Revisão completa" },
  { value: "performance", label: "Performance", description: "Otimizações" },
  { value: "segurança", label: "Segurança", description: "Vulnerabilidades" },
  { value: "legibilidade", label: "Legibilidade", description: "Clareza do código" },
  { value: "boas-práticas", label: "Boas Práticas", description: "Padrões e SOLID" },
];

interface DashboardClientProps {
  user: any;
  initialReviews: Review[];
}

function createFeedbackFromText(text: string): ReviewFeedback {
  return {
    summary: text || "Análise concluída.",
    issues: [],
    positives: [],
    score: 8,
  };
}

function normalizeFeedback(value: any): ReviewFeedback {
  if (!value) {
    return createFeedbackFromText("Não foi possível carregar o feedback.");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return {
        summary: parsed.summary || "Análise concluída.",
        issues: parsed.issues || [],
        positives: parsed.positives || [],
        score: parsed.score || 8,
      };
    } catch {
      return createFeedbackFromText(value);
    }
  }

  return {
    summary: value.summary || "Análise concluída.",
    issues: value.issues || [],
    positives: value.positives || [],
    score: value.score || 8,
  };
}

export function DashboardClient({ user, initialReviews }: DashboardClientProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("javascript");
  const [focus, setFocus] = useState<ReviewFocus>("geral");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");
  const [error, setError] = useState("");

  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  async function handleReview() {
    if (!code.trim()) {
      setError("Cole um trecho de código para revisar.");
      return;
    }

    setError("");
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          focus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
  const message =
    typeof data.error === "string"
      ? data.error
      : data.error?.message || "Erro ao revisar o código.";

  setError(
    message.includes("503") || message.includes("UNAVAILABLE")
      ? "A IA está com alta demanda no momento. Aguarde alguns segundos e tente novamente."
      : message
  );

  return;
}
      const feedbackData: ReviewFeedback = data.feedback
        ? normalizeFeedback(data.feedback)
        : createFeedbackFromText(
            typeof data.review === "string"
              ? data.review
              : data.review?.feedback || "Análise concluída."
          );

      setFeedback(feedbackData);

      const newReview: Review =
        typeof data.review === "object" && data.review !== null
          ? data.review
          : ({
              id: crypto.randomUUID(),
              code,
              language,
              focus,
              feedback: JSON.stringify(feedbackData),
              created_at: new Date().toISOString(),
              user_id: user?.id || "",
            } as Review);

      setReviews((prev) => [data.review, ...prev].slice(0, 20));
    } catch (err: any) {
      console.error("Erro no front:", err);
      setError(err.message || "Erro ao revisar o código.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectHistory(review: Review) {
  setCode(review.code);
  setLanguage(review.language as CodeLanguage);
  setFocus(review.focus as ReviewFocus);
  setFeedback(normalizeFeedback(review.feedback));
  setActiveTab("editor");
}

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-violet-600 rounded-lg">
              <Code2 className="w-4 h-4" />
            </div>

            <span className="font-bold text-sm">AI Code Reviewer</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {user?.email}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-1 lg:hidden bg-gray-900 border border-gray-800 rounded-xl p-1">
              {[
                { id: "editor", label: "Editor", icon: Code2 },
                { id: "history", label: "Histórico", icon: History },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as "editor" | "history")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === id
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className={clsx(activeTab !== "editor" && "hidden lg:block")}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Linguagem
                  </label>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {languages.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Foco da revisão
                  </label>

                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value as ReviewFocus)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {focuses.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label} — {f.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <CodeEditor value={code} onChange={setCode} language={language} />

              {error && (
                <p className="text-red-400 text-sm mt-3 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleReview}
                disabled={loading}
                className="mt-3 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Revisar código
                  </>
                )}
              </button>
            </div>

            {feedback && activeTab === "editor" && (
              <div className="mt-2">
                <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Feedback da IA
                </h2>

                <ReviewPanel feedback={feedback} />
              </div>
            )}
          </div>

          <div className={clsx("lg:block", activeTab !== "history" && "hidden lg:block")}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sticky top-20">
              <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2 mb-4">
                <History className="w-3.5 h-3.5" />
                Revisões recentes
              </h2>

              <HistoryList reviews={reviews} onSelect={handleSelectHistory} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}