"use client";

import { useRouter } from "next/navigation";

type Props = {
  history: number[];
  currentScore: number;
};

export function HistoryBreadcrumb({ history, currentScore }: Props) {
  const router = useRouter();

  function goBack() {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop();
    const prev = newHistory[newHistory.length - 1] ?? 108;
    const params = new URLSearchParams();
    params.set("score", String(prev));
    if (newHistory.length > 0) params.set("h", newHistory.join(","));
    router.push(`/?${params.toString()}`);
  }

  if (history.length === 0) return null;

  return (
    <div className="history-bar">
      <button
        type="button"
        className="history-back"
        onClick={goBack}
        aria-label="Vissza az előző score-hoz"
      >
        ← Vissza
      </button>
      <div className="history-trail">
        {history.map((s, i) => (
          <a
            key={`${s}-${i}`}
            className="history-link"
            href={`/?score=${s}&h=${history.slice(0, i).join(",")}`}
          >
            {s}
          </a>
        ))}
        <span className="history-current">{currentScore}</span>
      </div>
    </div>
  );
}
