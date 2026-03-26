"use client";

interface Props {
  imageUrl: string;
  prompt: string;
}

export default function ResultDisplay({ imageUrl, prompt }: Props) {
  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jchik-stamp-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <section className="bg-surface rounded-2xl shadow-md border border-border p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-primary-dark">
        產生結果
      </h2>

      {imageUrl ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative rounded-xl overflow-hidden border-2 border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Generated JChik sticker"
                className="max-w-full max-h-[400px] object-contain"
              />
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-2 px-4 rounded-xl font-medium
                       bg-primary-light hover:bg-primary text-text
                       transition-colors cursor-pointer"
          >
            下載貼圖
          </button>

          <details className="text-sm">
            <summary className="text-text-light cursor-pointer hover:text-text">
              查看完整 Prompt
            </summary>
            <p className="mt-2 p-3 bg-bg rounded-lg text-text-light break-all text-xs font-mono">
              {prompt}
            </p>
          </details>
        </div>
      ) : (
        <div className="text-center py-8 text-text-light">
          <p>圖片產生完成，但未取得圖片 URL。</p>
          <p className="text-sm mt-1">請檢查 API 回應格式。</p>
        </div>
      )}
    </section>
  );
}
