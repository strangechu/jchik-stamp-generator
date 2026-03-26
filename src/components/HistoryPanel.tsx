"use client";

interface HistoryItem {
  id: string;
  scenario: string;
  imageUrl: string;
  createdAt: string;
}

interface Props {
  history: HistoryItem[];
  onClear: () => void;
}

export default function HistoryPanel({ history, onClear }: Props) {
  return (
    <section className="bg-surface rounded-2xl shadow-md border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary-dark">
          歷史紀錄
        </h2>
        <button
          onClick={onClear}
          className="text-sm text-text-light hover:text-accent transition-colors cursor-pointer"
        >
          清除全部
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border
                       hover:border-primary transition-colors"
          >
            {item.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.imageUrl}
                alt={item.scenario}
                className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary-light flex items-center justify-center text-2xl shrink-0">
                🐤
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.scenario}</p>
              <p className="text-xs text-text-light">
                {new Date(item.createdAt).toLocaleString("zh-TW")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
