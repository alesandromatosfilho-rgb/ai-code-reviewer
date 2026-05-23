import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function extractScore(text: string) {
  const match = text.match(/NOTA\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*10/i);

  if (!match) {
    return 8;
  }

  const score = Number(match[1].replace(",", "."));

  if (Number.isNaN(score)) {
    return 8;
  }

  return Math.max(0, Math.min(10, score));
}
async function generateWithRetry(ai: any, prompt: string, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      return response;
    } catch (error: any) {
      const errorMessage = JSON.stringify(error);

      const isTemporaryError =
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("overloaded");

      if (isTemporaryError && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        continue;
      }

      throw new Error(
        "A IA está com alta demanda no momento. Tente novamente em alguns segundos."
      );
    }
  }

  throw new Error(
    "A IA está com alta demanda no momento. Tente novamente em alguns segundos."
  );
}
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave GEMINI_API_KEY não configurada no .env.local" },
        { status: 500 }
      );
    }
function extractScore(text: string) {
  const match = text.match(/NOTA\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*10/i);

  if (!match) {
    return 8;
  }

  const score = Number(match[1].replace(",", "."));

  if (Number.isNaN(score)) {
    return 8;
  }

  return Math.max(0, Math.min(10, score));
}
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const { code, language, focus } = await req.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "Digite um código antes de revisar." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
Você é um revisor de código especialista.

Analise o código abaixo em português brasileiro.

Responda de forma curta, organizada e fácil de ler.

Use exatamente este formato:

RESUMO:
Explique em até 3 linhas o que o código faz.

PROBLEMAS:
- Liste os problemas encontrados.
- Se não tiver problemas, diga "Nenhum problema grave encontrado".

PONTOS POSITIVOS:
- Liste o que está correto no código.

MELHORIAS:
- Liste melhorias recomendadas.

CÓDIGO CORRIGIDO:
Mostre o código corrigido somente se for necessário.

No final da resposta, dê uma nota realista para o código.

Use exatamente este formato no final:

NOTA: X/10

A nota deve variar conforme a qualidade do código:
- 10: código excelente
- 8 ou 9: código bom com pequenas melhorias
- 6 ou 7: código funcional, mas com problemas claros
- 4 ou 5: código com erros importantes
- 0 a 3: código quebrado ou inseguro

Linguagem: ${language || "JavaScript"}
Foco: ${focus || "Revisão completa"}

Código:
\`\`\`${language || "javascript"}
${code}
\`\`\`
`;
    const response = await generateWithRetry(ai, prompt);

    const reviewText = response.text || "Análise concluída.";

    const feedback = {
  summary: reviewText,
  issues: [],
  positives: [],
  score: extractScore(reviewText),
};

    const { data: savedReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        code,
        language,
        focus,
        feedback,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao salvar revisão:", insertError);

      return NextResponse.json(
        { error: "A IA analisou, mas não conseguiu salvar no histórico." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      feedback,
      review: savedReview,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/review:", error);

    return NextResponse.json(
      { error: error?.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}