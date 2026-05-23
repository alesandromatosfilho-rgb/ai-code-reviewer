export interface Review {
  id: string;
  user_id: string;
  code: string;
  language: string;
  focus: string;
  feedback: string;
  score: number | null;
  created_at: string;
}

export interface ReviewFeedback {
  summary: string;
  score: number;
  issues: {
    type: "error" | "warning" | "suggestion";
    line?: string;
    description: string;
    fix?: string;
  }[];
  positives: string[];
  refactored?: string;
}

export type ReviewFocus = "geral" | "performance" | "segurança" | "legibilidade" | "boas-práticas";
export type CodeLanguage = "javascript" | "typescript" | "python" | "java" | "cpp" | "go" | "rust";