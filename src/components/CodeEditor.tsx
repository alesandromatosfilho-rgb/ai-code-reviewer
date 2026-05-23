"use client";

import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { CodeLanguage } from "@/types";

const languageExtensions: Record<string, any> = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  python: python(),
  java: java(),
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeLanguage;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="360px"
      theme={vscodeDark}
      extensions={[languageExtensions[language] || javascript()]}
      onChange={onChange}
      className="rounded-xl overflow-hidden border border-gray-700 text-sm"
      placeholder="Cole seu código aqui..."
    />
  );
}