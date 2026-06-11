"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildSwapVariant,
  buildFirstDartVariants,
  buildSecondDartVariants,
  buildSetupVariants,
  type StrategyDartRow,
} from "@/lib/darts/checkout-variants";

type DartRow = { id: string; target: string; points: number; dartIndex: number };
type OutcomeRow = {
  id: string;
  label: string;
  scoredPoints: number;
  resultScore: number;
  resultType: "CHECKOUT" | "NEXT_SCORE" | "SETUP" | "BUST" | "NO_SCORE" | "INVALID";
  nextScore: number | null;
  explanation: string | null;
};

type Props = {
  index: number;
  strategyId: string;
  name: string;
  style: string | null;
  description: string | null;
  darts: DartRow[];
  outcomes: OutcomeRow[];
  targetScore: number;
  isPrimary: boolean;
  history: number[];
  forceOpen?: boolean;
};

export function StrategyRubric({
  index,
  name,
  style,
  description,
  darts,
  outcomes,
  targetScore,
  isPrimary,
  history,
  forceOpen = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(forceOpen);

  const dartRows: StrategyDartRow[] = darts
    .slice()
    .sort((a, b) => a.dartIndex - b.dartIndex)
    .map((d) => ({ target: d.target, points: d.points }));

  const swap = buildSwapVariant(dartRows, targetScore);
  const firstVariants = buildFirstDartVariants(dartRows, targetScore);
  const secondVariants = buildSecondDartVariants(dartRows, targetScore);
  const setupVariants = buildSetupVariants(dartRows, targetScore);

  function goToScore(next: number) {
    const newHistory = [...history, targetScore];
    const params = new URLSearchParams();
    params.set("score", String(next));
    params.set("h", newHistory.join(","));
    router.push(`/?${params.toString()}`);
  }

  const primaryDartList = dartRows.map((d) => d.target).join(" - ");

  return (
    <article className={`rubric ${isPrimary ? "rubric-primary" : ""}`}>
      <div className="rubric-header">
        <div className="rubric-num">{index}</div>
        <div className="rubric-main">
          <h3 className="rubric-title">
            {name}
            {isPrimary ? <span className="rubric-best">legjobb</span> : null}
          </h3>
          {style || description ? (
            <div className="rubric-meta">
              {style ? <span className="pill">{style}</span> : null}
              {description ? <span className="rubric-desc">{description}</span> : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="rubric-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Összecsukás" : "Lenyitás"}
        >
          {open ? "▲" : "▶"}
        </button>
      </div>

      <div className="rubric-primary-row">
        {dartRows.map((d, i) => (
          <div className="rubric-dart" key={i}>
            <span className="rubric-dart-target">{d.target}</span>
            <small>{d.points} pont</small>
          </div>
        ))}
        <div className="rubric-arrow">→</div>
        <div className="rubric-result rubric-result-checkout">CHECKOUT</div>
      </div>

      {swap ? (
        <div className="rubric-swap-row">
          <span className="rubric-swap-label">swap:</span>
          {swap.map((d, i) => (
            <span className="rubric-dart-small" key={i}>
              {d.target}
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="rubric-panel">
          {firstVariants.length > 0 ? (
            <section className="rubric-section">
              <h4>1. dobás variánsok (2. dobás és zárás azonos)</h4>
              <ul className="rubric-variants">
                {firstVariants.slice(0, 12).map((v, i) => (
                  <li key={i}>
                    <span className="rubric-variants-darts">
                      {v.darts.map((d) => d.target).join(" - ")}
                    </span>
                    <span className="rubric-variants-result">→ checkout</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {secondVariants.length > 0 ? (
            <section className="rubric-section">
              <h4>2. dobás variánsok (1. dobás és zárás azonos)</h4>
              <ul className="rubric-variants">
                {secondVariants.slice(0, 12).map((v, i) => (
                  <li key={i}>
                    <span className="rubric-variants-darts">
                      {v.darts.map((d) => d.target).join(" - ")}
                    </span>
                    <span className="rubric-variants-result">→ checkout</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {setupVariants.length > 0 ? (
            <section className="rubric-section">
              <h4>Mentő / setup ágak (nem azonnali checkout)</h4>
              <ul className="rubric-variants">
                {setupVariants.map((v, i) => (
                  <li key={i}>
                    <span className="rubric-variants-darts">
                      {v.darts.map((d) => d.target).join(" - ")}
                    </span>
                    <span className="rubric-variants-result">
                      → {v.resultScore} marad
                    </span>
                    <button
                      type="button"
                      className="rubric-next-arrow"
                      onClick={() => goToScore(v.resultScore)}
                      aria-label={`Ugrás a ${v.resultScore} score-ra`}
                    >
                      ➜
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {outcomes.length > 0 ? (
            <section className="rubric-section">
              <h4>Adatbázis outcome-ok</h4>
              <ul className="rubric-outcomes">
                {outcomes.map((o) => (
                  <li key={o.id}>
                    <span className="rubric-outcomes-label">{o.label}</span>
                    <span className="rubric-outcomes-info">
                      {o.scoredPoints} dobva → {o.resultScore} marad · {o.resultType}
                    </span>
                    {o.resultType === "CHECKOUT" ? (
                      <span className="rubric-pill rubric-pill-checkout">checkout</span>
                    ) : o.nextScore !== null ? (
                      <button
                        type="button"
                        className="rubric-next-arrow"
                        onClick={() => goToScore(o.nextScore!)}
                        aria-label={`Ugrás a ${o.nextScore} score-ra`}
                      >
                        {o.nextScore} ➜
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
