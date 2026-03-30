"use client";

import { useState, useEffect, useCallback } from "react";

interface GalleryItem {
  id: string;
  scenario: string;
  author: string;
  imageFile: string;
  createdAt: string;
}

interface GalleryResponse {
  items: GalleryItem[];
  total: number;
  totalPages: number;
  page: number;
}

interface Props {
  refreshTrigger?: number; // bump to force a refresh after new generation
}

export default function GalleryPanel({ refreshTrigger }: Props) {
  const [data, setData] = useState<GalleryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?page=${p}`);
      if (res.ok) {
        const json: GalleryResponse = await res.json();
        setData(json);
        setPage(json.page);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  // Refresh when a new image is generated
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchPage(1);
      setPage(1);
    }
  }, [refreshTrigger, fetchPage]);

  const imageUrl = (item: GalleryItem) =>
    `/api/gallery/image?file=${encodeURIComponent(item.imageFile)}`;

  const downloadUrl = (item: GalleryItem) => imageUrl(item);

  if (!data || data.total === 0) {
    return (
      <section className="bg-surface rounded-2xl shadow-md border border-border p-6">
        <h2 className="text-xl font-semibold text-primary-dark mb-4">大家產生的貼圖</h2>
        <p className="text-text-light text-sm text-center py-8">還沒有人產生貼圖，快來第一個試試！</p>
      </section>
    );
  }

  return (
    <section className="bg-surface rounded-2xl shadow-md border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary-dark">
          大家產生的貼圖
          <span className="ml-2 text-sm font-normal text-text-light">
            共 {data.total} 張
          </span>
        </h2>
        <button
          onClick={() => fetchPage(page)}
          disabled={loading}
          className="text-sm text-text-light hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "載入中..." : "重新整理"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl border border-border overflow-hidden bg-white
                       hover:border-primary hover:shadow-md transition-all flex flex-col"
          >
              {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(item)}
              alt={item.scenario}
              className="w-full aspect-square object-contain p-2"
              loading="lazy"
            />
            {/* Always-visible footer */}
            <div className="px-3 py-2 flex flex-col items-center gap-2 flex-grow">
              <p className="text-sm text-center text-text w-full break-words line-clamp-4">{item.scenario}</p>
              <p className="text-xs text-center text-text-light w-full">by {item.author}</p>
              <a
                href={downloadUrl(item)}
                download={`jchik-${item.id}.png`}
                className="px-3 py-1.5 bg-primary rounded-lg text-xs font-bold text-text
                           hover:bg-primary-dark transition-colors opacity-0 group-hover:opacity-100 mt-auto"
              >
                下載
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-border text-sm
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            ← 上一頁
          </button>

          <span className="text-sm text-text-light px-2">
            {page} / {data.totalPages}
          </span>

          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= data.totalPages || loading}
            className="px-3 py-1.5 rounded-lg border border-border text-sm
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            下一頁 →
          </button>
        </div>
      )}
    </section>
  );
}
