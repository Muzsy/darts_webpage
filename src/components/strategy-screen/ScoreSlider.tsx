"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  currentScore: number;
  maxScore?: number;
  history?: number[];
};

const SCORE_VALUES = Array.from({ length: 170 }, (_, i) => 170 - i);

export function ScoreSlider({ currentScore, maxScore = 170, history = [] }: Props) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function goTo(score: number, pushHistory = true) {
    const next = Math.max(0, Math.min(maxScore, score));
    if (next === currentScore) return;
    if (pushHistory && history.length > 0) {
      const from = history[history.length - 1];
      if (from !== currentScore) return;
    }
    const params = new URLSearchParams();
    params.set("score", String(next));
    if (pushHistory && history.length > 0) {
      const newHistory = [...history, currentScore];
      params.set("h", newHistory.join(","));
    }
    router.push(`/?${params.toString()}`);
  }

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const score = Math.round(170 - ratio * 169);
      goTo(score, false);
    }
    function onUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, currentScore]);

  function onTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const score = Math.round(170 - ratio * 169);
    goTo(score);
  }

  const handlePosition = ((170 - currentScore) / 169) * 100;

  return (
    <div className="score-slider">
      <div
        className="score-slider-track"
        ref={trackRef}
        onClick={onTrackClick}
      >
        <div className="score-slider-bar" />
        <div
          className="score-slider-handle"
          style={{ left: `${handlePosition}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={170}
          aria-valuenow={currentScore}
        />
        <div className="score-slider-center">
          <div className="score-slider-center-frame">
            <span className="score-slider-center-value">{currentScore}</span>
          </div>
        </div>
      </div>

      <div className="score-slider-ticks">
        {SCORE_VALUES.filter((s) => s % 10 === 0 || s === 1).map((s) => {
          const left = ((170 - s) / 169) * 100;
          return (
            <span
              key={s}
              className="score-slider-tick"
              style={{ left: `${left}%` }}
              onClick={() => goTo(s)}
            >
              {s}
            </span>
          );
        })}
      </div>

      <div className="score-slider-input">
        <form action="/" method="get">
          {history.length > 0 ? <input type="hidden" name="h" value={history.join(",")} /> : null}
          <label htmlFor="score">Pontos score:</label>
          <input id="score" name="score" type="number" min="0" max="170" defaultValue={currentScore} />
          <button type="submit">Ugrás</button>
        </form>
      </div>
    </div>
  );
}
