import { scoreTarget, isCheckoutClosingTarget } from "./scoring";

export type VariantDart = {
  target: string;
  points: number;
};

export type VariantRow = {
  darts: VariantDart[];
  resultScore: number;
  resultType: "CHECKOUT" | "NEXT_SCORE" | "BUST" | "NO_SCORE";
  explanation: string;
};

export type StrategyDartRow = {
  target: string;
  points: number;
};

const SINGLE_SEGMENTS = Array.from({ length: 20 }, (_, i) => i + 1);
const DOUBLE_SEGMENTS = Array.from({ length: 20 }, (_, i) => (i + 1) * 2);
const TREBLE_SEGMENTS = Array.from({ length: 20 }, (_, i) => (i + 1) * 3);

const CLOSING_DOUBLES = DOUBLE_SEGMENTS;
const CLOSING_BULL = [50];
const CLOSING_SBULL = [25];

function allSingleTargets(): VariantDart[] {
  return SINGLE_SEGMENTS.map((s) => ({ target: `S${s}`, points: s }));
}

function allTrebleTargets(): VariantDart[] {
  return SINGLE_SEGMENTS.map((s) => ({ target: `T${s}`, points: s * 3 }));
}

function allClosingTargets(): VariantDart[] {
  const out: VariantDart[] = [];
  for (const seg of SINGLE_SEGMENTS) {
    out.push({ target: `D${seg}`, points: seg * 2 });
  }
  out.push({ target: "Bull", points: 50 });
  out.push({ target: "SBull", points: 25 });
  return out;
}

export function buildSwapVariant(
  darts: StrategyDartRow[],
  targetScore: number
): VariantDart[] | null {
  if (darts.length !== 3) return null;
  const [a, b, c] = darts;
  if (a.points + b.points + c.points !== targetScore) return null;
  if (!isCheckoutClosingTarget(c.target)) return null;
  return [b, a, c];
}

export function buildFirstDartVariants(
  darts: StrategyDartRow[],
  targetScore: number
): VariantRow[] {
  if (darts.length !== 3) return [];
  const [_, b, c] = darts;
  if (!isCheckoutClosingTarget(c.target)) return [];

  const out: VariantRow[] = [];
  const secondDartPoints = b.points;
  const closingPoints = c.points;

  const candidates: VariantDart[] = [...allTrebleTargets(), ...allSingleTargets()];
  for (const cand of candidates) {
    if (cand.target === darts[0].target) continue;
    const remaining = targetScore - cand.points - secondDartPoints;
    if (remaining < 0) continue;
    if (remaining === 0) {
      out.push({
        darts: [cand, b, c],
        resultScore: 0,
        resultType: "CHECKOUT",
        explanation: `${cand.target} ${b.target} ${c.target}`,
      });
      continue;
    }
    if (remaining <= 40 && remaining % 2 === 0) {
      const closing = { target: `D${remaining / 2}`, points: remaining };
      out.push({
        darts: [cand, b, closing],
        resultScore: 0,
        resultType: "CHECKOUT",
        explanation: `${cand.target} ${b.target} ${closing.target}`,
      });
    }
  }
  return out;
}

export function buildSecondDartVariants(
  darts: StrategyDartRow[],
  targetScore: number
): VariantRow[] {
  if (darts.length !== 3) return [];
  const [a, _, c] = darts;
  if (!isCheckoutClosingTarget(c.target)) return [];

  const out: VariantRow[] = [];
  const firstDartPoints = a.points;
  const candidates: VariantDart[] = [
    ...allTrebleTargets(),
    ...allSingleTargets(),
    { target: "Bull", points: 50 },
    { target: "SBull", points: 25 },
  ];
  for (const cand of candidates) {
    if (cand.target === darts[1].target) continue;
    const afterFirstTwo = targetScore - firstDartPoints - cand.points;
    if (afterFirstTwo < 0) continue;
    if (afterFirstTwo === 0) {
      out.push({
        darts: [a, cand, c],
        resultScore: 0,
        resultType: "CHECKOUT",
        explanation: `${a.target} ${cand.target} ${c.target}`,
      });
      continue;
    }
    if (afterFirstTwo <= 40 && afterFirstTwo % 2 === 0) {
      out.push({
        darts: [a, cand, { target: `D${afterFirstTwo / 2}`, points: afterFirstTwo }],
        resultScore: 0,
        resultType: "CHECKOUT",
        explanation: `${a.target} ${cand.target} D${afterFirstTwo / 2}`,
      });
    }
  }
  return out;
}

export function buildSetupVariants(
  darts: StrategyDartRow[],
  targetScore: number
): VariantRow[] {
  if (darts.length !== 3) return [];
  const [_, __, c] = darts;
  if (!isCheckoutClosingTarget(c.target)) return [];

  const out: VariantRow[] = [];
  const candidates: VariantDart[] = [
    ...allTrebleTargets(),
    ...allSingleTargets(),
    { target: "Bull", points: 50 },
    { target: "SBull", points: 25 },
  ];
  for (const cand of candidates) {
    if (cand.target === darts[1].target) continue;
    const remaining = targetScore - darts[0].points - cand.points;
    if (remaining < 0 || remaining >= targetScore) continue;
    if (isCheckoutClosingTarget(c.target) && remaining === 0) continue;
    if (remaining > 0) {
      out.push({
        darts: [darts[0], cand, c],
        resultScore: remaining,
        resultType: "NEXT_SCORE",
        explanation: `${darts[0].target} ${cand.target} ${c.target} → ${remaining} marad`,
      });
    }
  }
  return out.slice(0, 12);
}

export function formatDart(d: VariantDart): string {
  return d.target;
}

export function formatRow(row: VariantRow): string {
  return row.darts.map(formatDart).join("-");
}
