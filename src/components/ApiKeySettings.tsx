"use client";

import { useState } from "react";

interface Props {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function ApiKeySettings({ apiKey, onApiKeyChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-text-light hover:text-text transition-colors cursor-pointer"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        API Key 設定
        {apiKey ? (
          <span className="text-green-600 text-xs">(已設定)</span>
        ) : (
          <span className="text-xs text-red-500">(未輸入，生圖將有每日十張限制)</span>
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-surface rounded-xl border border-border">
          <p className="text-sm text-text-light mb-3">
            輸入你自己的 Google AI Studio API Key 以解除每日限制。未輸入則為小雞自掏腰包。
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Google AI Studio API Key"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm
                         focus:outline-none focus:border-primary bg-white"
            />
            {apiKey && (
              <button
                onClick={() => onApiKeyChange("")}
                className="px-3 py-2 text-sm text-accent border border-red-200 rounded-lg
                           hover:bg-red-50 transition-colors cursor-pointer"
              >
                清除
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
