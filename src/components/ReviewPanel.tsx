"use client";

import { ReviewFeedback } from "@/types";
import { AlertCircle, AlertTriangle, Lightbulb, CheckCircle, ChevronDown, ChevronUp, Code } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const issueConfig = {
  error: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    label: "Erro",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    label: "Aviso",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    label: "Sugestão",
  },
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400">score</span>
      </div>
    </div>
  );
}

interface ReviewPanelProps {
  feedback: ReviewFeedback;
}

export function ReviewPanel({ feedback }: ReviewPanelProps) {
  const [showRefactored, setShowRefactored] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header com score */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-6">
        <ScoreRing score={feedback.score} />
        <div>
          <h3 className="font-semibold text-lg mb-1">Resultado da Revisão</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{feedback.summary}</p>
        </div>
      </div>

      {/* Pontos positivos */}
      {feedback.positives.length > 0 && (
        <div className="bg-green-400/5 border border-green-400/20 rounded-2xl p-5">
          <h4 className="flex items-center gap-2 font-medium text-green-400 mb-3">
            <CheckCircle className="w-4 h-4" /> Pontos positivos
          </h4>
          <ul className="space-y-1.5">
            {feedback.positives.map((point, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Problemas encontrados */}
      {feedback.issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-300">
            Problemas encontrados ({feedback.issues.length})
          </h4>
          {feedback.issues.map((issue, i) => {
            const config = issueConfig[issue.type];
            const Icon = config.icon;
            return (
              <div key={i} className={clsx("border rounded-xl p-4", config.bg)}>
                <div className="flex items-start gap-3">
                  <Icon className={clsx("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("text-xs font-semibold uppercase tracking-wide", config.color)}>
                        {config.label}
                      </span>
                      {issue.line && (
                        <code className="text-xs bg-gray-800 rounded px-1.5 py-0.5 text-gray-300 truncate max-w-50">
                          {issue.line}
                        </code>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{issue.description}</p>
                    {issue.fix && (
                      <p className="text-xs text-gray-400 mt-1.5 border-t border-gray-700/50 pt-1.5">
                        💡 {issue.fix}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Código refatorado */}
      {feedback.refactored && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowRefactored(!showRefactored)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Code className="w-4 h-4 text-violet-400" />
              Ver código refatorado
            </span>
            {showRefactored ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showRefactored && (
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto border-t border-gray-800 bg-gray-950">
              <code>{feedback.refactored}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}