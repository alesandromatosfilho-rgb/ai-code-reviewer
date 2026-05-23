import Link from "next/link";
import { Code2, Sparkles, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by OpenAI
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-violet-600 rounded-2xl">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-linear-to-br from-white to-gray-400 bg-clip-text text-transparent">
            AI Code Reviewer
          </h1>
        </div>

        <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
          Revisão de código inteligente com IA. Detecta bugs, vulnerabilidades e sugere melhorias em segundos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 transition-colors rounded-2xl px-8 py-4 text-base font-semibold"
          >
            Começar agora
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl px-8 py-4 text-base font-semibold text-gray-300"
          >
            Ver dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: "Análise instantânea", desc: "Feedback em segundos com GPT-4o" },
            { icon: Shield, title: "Detecção de bugs", desc: "Encontra problemas antes do deploy" },
            { icon: CheckCircle, title: "Boas práticas", desc: "Sugestões baseadas em padrões da indústria" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left">
              <div className="p-2 bg-violet-600/10 rounded-xl w-fit mb-3">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}