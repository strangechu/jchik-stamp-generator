"use client";

import { useState, useEffect, FormEvent } from "react";
import ApiKeySettings from "@/components/ApiKeySettings";
import ResultDisplay from "@/components/ResultDisplay";
import HistoryPanel from "@/components/HistoryPanel";

interface HistoryItem {
  id: string;
  scenario: string;
  prompt: string;
  imageUrl: string; // only kept in memory, not persisted
  createdAt: string;
}

interface HistoryStorageItem {
  id: string;
  scenario: string;
  prompt: string;
  createdAt: string;
}

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    imageUrl: string;
    prompt: string;
  } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage (text only, no images)
  useEffect(() => {
    const stored = localStorage.getItem("jchik-history");
    if (stored) {
      try {
        const items: HistoryStorageItem[] = JSON.parse(stored);
        setHistory(items.map((item) => ({ ...item, imageUrl: "" })));
      } catch {
        localStorage.removeItem("jchik-history");
      }
    }
  }, []);

  // Save history to localStorage (exclude imageUrl to avoid quota issues)
  useEffect(() => {
    if (history.length > 0) {
      const toStore: HistoryStorageItem[] = history.slice(0, 10).map(
        ({ id, scenario, prompt, createdAt }) => ({ id, scenario, prompt, createdAt })
      );
      try {
        localStorage.setItem("jchik-history", JSON.stringify(toStore));
      } catch {
        // quota exceeded — clear old entries and retry
        localStorage.removeItem("jchik-history");
      }
    }
  }, [history]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: scenario.trim(),
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "產生失敗，請稍後再試");
        return;
      }

      // Build data URI from base64 response
      const imageUrl = data.imageBase64
        ? `data:${data.imageMimeType || "image/png"};base64,${data.imageBase64}`
        : "";

      setResult({ imageUrl, prompt: data.prompt });

      // Add to history (store base64 data URI)
      if (imageUrl) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          scenario: scenario.trim(),
          prompt: data.prompt,
          imageUrl,
          createdAt: new Date().toISOString(),
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 20));
      }
    } catch {
      setError("網路錯誤，請檢查連線後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">
          🐤 囧雞貼圖產生器
        </h1>
        <p className="text-text-light text-lg">
          JChik Stamp Generator — AI 驅動的囧雞風格貼圖
        </p>
      </header>

      {/* API Key Settings */}
      <ApiKeySettings apiKey={apiKey} onApiKeyChange={setApiKey} />

      {/* Generator Form */}
      <section className="bg-surface rounded-2xl shadow-md border border-border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-primary-dark">
          描述你想要的貼圖情境
        </h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="例如：開心地吃著炸雞、在下雨天撐傘、生氣地跺腳、送你一朵花..."
              className="w-full p-4 border-2 border-border rounded-xl text-base resize-none
                         focus:outline-none focus:border-primary transition-colors
                         bg-white placeholder:text-text-light/50"
              rows={3}
              maxLength={200}
            />
            <div className="text-right text-sm text-text-light mt-1">
              {scenario.length}/200
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !scenario.trim()}
            className="w-full py-3 px-6 rounded-xl font-bold text-lg
                       bg-primary hover:bg-primary-dark active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-text transition-all duration-150 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                產生中...
              </span>
            ) : (
              "產生貼圖"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-accent text-sm">
            {error}
          </div>
        )}
      </section>

      {/* Result Display */}
      {result && <ResultDisplay imageUrl={result.imageUrl} prompt={result.prompt} />}

      {/* History */}
      {history.length > 0 && (
        <HistoryPanel
          history={history}
          onClear={() => {
            setHistory([]);
            localStorage.removeItem("jchik-history");
          }}
        />
      )}
    </main>
  );
}
