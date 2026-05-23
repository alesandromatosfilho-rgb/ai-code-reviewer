"use client";

import { Review } from "@/types";
import { Clock, Trash2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import clsx from "clsx";

const languageColors: Record<string, string> = {
  javascript: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  typescript: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  python: "bg-green-400/10 text-green-400 border-green-400/20",
  java: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  cpp: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  go: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  rust: "bg-red-400/10 text-red-400 border-red-400/20",
};

interface HistoryListProps {
  reviews: Review[];
  onSelect: (review: Review) => void;
}

export function HistoryList({ reviews: initialReviews, onSelect }: HistoryListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const supabase = createClient();

  async function deleteReview(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhuma revisão ainda.</p>
        <p className="text-xs mt-1">Faça sua primeira revisão de código!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reviews.map((review) => {
        const scoreColor =
          review.score && review.score >= 80
            ? "text-green-400"
            : review.score && review.score >= 50
            ? "text-yellow-400"
            : "text-red-400";

        return (
          <div
            key={review.id}
            onClick={() => onSelect(review)}
            className="group flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-3.5 cursor-pointer transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded-md border font-medium",
                    languageColors[review.language] || "bg-gray-700 text-gray-300 border-gray-600"
                  )}
                >
                  {review.language}
                </span>
                <span className="text-xs text-gray-500 capitalize">{review.focus}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {new Date(review.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {review.score && (
              <span className={clsx("text-sm font-bold", scoreColor)}>
                {review.score}
              </span>
            )}

            <button
              onClick={(e) => deleteReview(review.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-gray-600 transition-all rounded-lg hover:bg-red-400/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />

          </div>
        );
      })}
    </div>
  );
}