export type DartMultiplier = "S" | "D" | "T" | "SBULL" | "BULL";

export function scoreTarget(target: string): number {
  const normalized = target.trim().toUpperCase();

  if (["BULL", "INNERBULL", "INNER_BULL", "DBULL"].includes(normalized)) return 50;
  if (["SBULL", "OUTERBULL", "OUTER_BULL", "25"].includes(normalized)) return 25;

  const match = normalized.match(/^([SDT])(\d{1,2})$/);
  if (!match) throw new Error(`Invalid dart target: ${target}`);

  const [, multiplier, segmentText] = match;
  const segment = Number(segmentText);

  if (!Number.isInteger(segment) || segment < 1 || segment > 20) {
    throw new Error(`Invalid dart segment: ${target}`);
  }

  if (multiplier === "S") return segment;
  if (multiplier === "D") return segment * 2;
  if (multiplier === "T") return segment * 3;

  throw new Error(`Invalid dart multiplier: ${target}`);
}

export function isCheckoutClosingTarget(target: string): boolean {
  const normalized = target.trim().toUpperCase();
  return normalized.startsWith("D") || ["BULL", "INNERBULL", "INNER_BULL", "DBULL"].includes(normalized);
}
