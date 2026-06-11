import { PrismaClient, ScoreCategory, StrategyStyle, StrategyType, Multiplier, ResultType } from "@prisma/client";

const prisma = new PrismaClient();

const bogeyScores = new Set([169, 168, 166, 165, 163, 162, 159]);

function categoryForScore(score: number): ScoreCategory {
  if (score === 0) return ScoreCategory.TERMINAL;
  if (score === 1) return ScoreCategory.BUST_LIKE;
  if (bogeyScores.has(score)) return ScoreCategory.BOGEY;
  if (score >= 2 && score <= 170) return ScoreCategory.CHECKOUT_POSSIBLE;
  return ScoreCategory.NORMAL;
}

async function seedScores() {
  for (let score = 0; score <= 501; score += 1) {
    await prisma.score.upsert({
      where: { score },
      update: { category: categoryForScore(score) },
      create: {
        score,
        category: categoryForScore(score),
        title: score === 0 ? "Checkout" : `${score}`,
        note: bogeyScores.has(score) ? "Klasszikus háromnyilas bogey szám." : null
      }
    });
  }
}

async function seedStrategies() {
  await prisma.strategyOutcome.deleteMany();
  await prisma.strategyDart.deleteMany();
  await prisma.strategy.deleteMany();
}

type CheckoutDart = {
  target: string;
  multiplier: Multiplier;
  segment: string;
  points: number;
};

type CheckoutRoute = {
  name: string;
  style: StrategyStyle;
  darts: CheckoutDart[];
};

function d(target: string, mult: Multiplier, segment: string, points: number): CheckoutDart {
  return { target, multiplier: mult, segment, points };
}

function validateRoute(score: number, route: CheckoutRoute): string | null {
  const sum = route.darts.reduce((a, x) => a + x.points, 0);
  if (sum !== score) return `dart sum ${sum} != ${score}`;
  if (route.darts.length < 1 || route.darts.length > 3) {
    return `dart count ${route.darts.length} out of range 1-3`;
  }
  const last = route.darts[route.darts.length - 1];
  if (last.multiplier !== Multiplier.D && last.multiplier !== Multiplier.BULL) {
    return `last dart ${last.target} (${last.multiplier}) is not D or BULL`;
  }
  return null;
}

function buildCheckouts(): Map<number, CheckoutRoute[]> {
  const m = new Map<number, CheckoutRoute[]>();

  const add = (score: number, route: CheckoutRoute) => {
    const err = validateRoute(score, route);
    if (err) throw new Error(`[build] invalid route for ${score}: ${err}`);
    if (!m.has(score)) m.set(score, []);
    m.get(score)!.push(route);
  };

  // ===== WEB CANONICAL ROUTES (forrás: dartscheckoutassistant.com) =====
  add(2, { name: "D1", style: StrategyStyle.BALANCED, darts: [
    d("D1", Multiplier.D, "1", 2)
  ] });
  add(3, { name: "S1 D1", style: StrategyStyle.BALANCED, darts: [
    d("S1", Multiplier.S, "1", 1),
    d("D1", Multiplier.D, "1", 2)
  ] });
  add(4, { name: "D2", style: StrategyStyle.BALANCED, darts: [
    d("D2", Multiplier.D, "2", 4)
  ] });
  add(5, { name: "S1 D2", style: StrategyStyle.BALANCED, darts: [
    d("S1", Multiplier.S, "1", 1),
    d("D2", Multiplier.D, "2", 4)
  ] });
  add(6, { name: "D3", style: StrategyStyle.BALANCED, darts: [
    d("D3", Multiplier.D, "3", 6)
  ] });
  add(6, { name: "S2 D2 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S2", Multiplier.S, "2", 2),
    d("D2", Multiplier.D, "2", 4)
  ] });
  add(7, { name: "S3 D2", style: StrategyStyle.BALANCED, darts: [
    d("S3", Multiplier.S, "3", 3),
    d("D2", Multiplier.D, "2", 4)
  ] });
  add(8, { name: "D4", style: StrategyStyle.BALANCED, darts: [
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(9, { name: "S1 D4", style: StrategyStyle.BALANCED, darts: [
    d("S1", Multiplier.S, "1", 1),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(10, { name: "D5", style: StrategyStyle.BALANCED, darts: [
    d("D5", Multiplier.D, "5", 10)
  ] });
  add(10, { name: "S2 D4 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S2", Multiplier.S, "2", 2),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(11, { name: "S3 D4", style: StrategyStyle.BALANCED, darts: [
    d("S3", Multiplier.S, "3", 3),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(12, { name: "D6", style: StrategyStyle.BALANCED, darts: [
    d("D6", Multiplier.D, "6", 12)
  ] });
  add(13, { name: "S5 D4", style: StrategyStyle.BALANCED, darts: [
    d("S5", Multiplier.S, "5", 5),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(14, { name: "D7", style: StrategyStyle.BALANCED, darts: [
    d("D7", Multiplier.D, "7", 14)
  ] });
  add(15, { name: "S7 D4", style: StrategyStyle.BALANCED, darts: [
    d("S7", Multiplier.S, "7", 7),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(16, { name: "D8", style: StrategyStyle.BALANCED, darts: [
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(17, { name: "S9 D4", style: StrategyStyle.BALANCED, darts: [
    d("S9", Multiplier.S, "9", 9),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(18, { name: "D9", style: StrategyStyle.BALANCED, darts: [
    d("D9", Multiplier.D, "9", 18)
  ] });
  add(19, { name: "S11 D4", style: StrategyStyle.BALANCED, darts: [
    d("S11", Multiplier.S, "11", 11),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(19, { name: "S3 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S3", Multiplier.S, "3", 3),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(20, { name: "D10", style: StrategyStyle.BALANCED, darts: [
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(21, { name: "S13 D4", style: StrategyStyle.BALANCED, darts: [
    d("S13", Multiplier.S, "13", 13),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(21, { name: "S5 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S5", Multiplier.S, "5", 5),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(22, { name: "D11", style: StrategyStyle.BALANCED, darts: [
    d("D11", Multiplier.D, "11", 22)
  ] });
  add(23, { name: "S7 D8", style: StrategyStyle.BALANCED, darts: [
    d("S7", Multiplier.S, "7", 7),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(24, { name: "D12", style: StrategyStyle.BALANCED, darts: [
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(25, { name: "S9 D8", style: StrategyStyle.BALANCED, darts: [
    d("S9", Multiplier.S, "9", 9),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(25, { name: "S17 D4 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S17", Multiplier.S, "17", 17),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(26, { name: "D13", style: StrategyStyle.BALANCED, darts: [
    d("D13", Multiplier.D, "13", 26)
  ] });
  add(27, { name: "S19 D4", style: StrategyStyle.BALANCED, darts: [
    d("S19", Multiplier.S, "19", 19),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(27, { name: "S7 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S7", Multiplier.S, "7", 7),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(28, { name: "D14", style: StrategyStyle.BALANCED, darts: [
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(29, { name: "S13 D8", style: StrategyStyle.BALANCED, darts: [
    d("S13", Multiplier.S, "13", 13),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(29, { name: "S5 D12 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S5", Multiplier.S, "5", 5),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(30, { name: "D15", style: StrategyStyle.BALANCED, darts: [
    d("D15", Multiplier.D, "15", 30)
  ] });
  add(31, { name: "S15 D8", style: StrategyStyle.BALANCED, darts: [
    d("S15", Multiplier.S, "15", 15),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(31, { name: "S7 D12 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S7", Multiplier.S, "7", 7),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(32, { name: "D16", style: StrategyStyle.BALANCED, darts: [
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(33, { name: "S17 D8", style: StrategyStyle.BALANCED, darts: [
    d("S17", Multiplier.S, "17", 17),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(33, { name: "S1 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S1", Multiplier.S, "1", 1),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(34, { name: "D17", style: StrategyStyle.BALANCED, darts: [
    d("D17", Multiplier.D, "17", 34)
  ] });
  add(35, { name: "S3 D16", style: StrategyStyle.BALANCED, darts: [
    d("S3", Multiplier.S, "3", 3),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(35, { name: "S19 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S19", Multiplier.S, "19", 19),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(36, { name: "D18", style: StrategyStyle.BALANCED, darts: [
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(37, { name: "S5 D16", style: StrategyStyle.BALANCED, darts: [
    d("S5", Multiplier.S, "5", 5),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(38, { name: "D19", style: StrategyStyle.BALANCED, darts: [
    d("D19", Multiplier.D, "19", 38)
  ] });
  add(39, { name: "S7 D16", style: StrategyStyle.BALANCED, darts: [
    d("S7", Multiplier.S, "7", 7),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(39, { name: "S19 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S19", Multiplier.S, "19", 19),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(40, { name: "D20", style: StrategyStyle.BALANCED, darts: [
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(41, { name: "S9 D16", style: StrategyStyle.BALANCED, darts: [
    d("S9", Multiplier.S, "9", 9),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(41, { name: "S1 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S1", Multiplier.S, "1", 1),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(42, { name: "S10 D16", style: StrategyStyle.BALANCED, darts: [
    d("S10", Multiplier.S, "10", 10),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(42, { name: "S6 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S6", Multiplier.S, "6", 6),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(43, { name: "S11 D16", style: StrategyStyle.BALANCED, darts: [
    d("S11", Multiplier.S, "11", 11),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(43, { name: "S3 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S3", Multiplier.S, "3", 3),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(44, { name: "S12 D16", style: StrategyStyle.BALANCED, darts: [
    d("S12", Multiplier.S, "12", 12),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(44, { name: "S4 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S4", Multiplier.S, "4", 4),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(45, { name: "S13 D16", style: StrategyStyle.BALANCED, darts: [
    d("S13", Multiplier.S, "13", 13),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(45, { name: "S5 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S5", Multiplier.S, "5", 5),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(46, { name: "S6 D20", style: StrategyStyle.BALANCED, darts: [
    d("S6", Multiplier.S, "6", 6),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(46, { name: "S10 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S10", Multiplier.S, "10", 10),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(47, { name: "S15 D16", style: StrategyStyle.BALANCED, darts: [
    d("S15", Multiplier.S, "15", 15),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(47, { name: "S7 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S7", Multiplier.S, "7", 7),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(48, { name: "S8 D20", style: StrategyStyle.BALANCED, darts: [
    d("S8", Multiplier.S, "8", 8),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(48, { name: "S16 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S16", Multiplier.S, "16", 16),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(49, { name: "S9 D20", style: StrategyStyle.BALANCED, darts: [
    d("S9", Multiplier.S, "9", 9),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(49, { name: "S17 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S17", Multiplier.S, "17", 17),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(50, { name: "S10 D20", style: StrategyStyle.BALANCED, darts: [
    d("S10", Multiplier.S, "10", 10),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(50, { name: "T10 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T10", Multiplier.T, "10", 30),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(51, { name: "S11 D20", style: StrategyStyle.BALANCED, darts: [
    d("S11", Multiplier.S, "11", 11),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(51, { name: "S15 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S15", Multiplier.S, "15", 15),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(52, { name: "S12 D20", style: StrategyStyle.BALANCED, darts: [
    d("S12", Multiplier.S, "12", 12),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(52, { name: "T12 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T12", Multiplier.T, "12", 36),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(53, { name: "S13 D20", style: StrategyStyle.BALANCED, darts: [
    d("S13", Multiplier.S, "13", 13),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(53, { name: "S17 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S17", Multiplier.S, "17", 17),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(54, { name: "S14 D20", style: StrategyStyle.BALANCED, darts: [
    d("S14", Multiplier.S, "14", 14),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(55, { name: "S15 D20", style: StrategyStyle.BALANCED, darts: [
    d("S15", Multiplier.S, "15", 15),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(56, { name: "S16 D20", style: StrategyStyle.BALANCED, darts: [
    d("S16", Multiplier.S, "16", 16),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(56, { name: "T16 D4 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D4", Multiplier.D, "4", 8)
  ] });
  add(57, { name: "S17 D20", style: StrategyStyle.BALANCED, darts: [
    d("S17", Multiplier.S, "17", 17),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(58, { name: "S18 D20", style: StrategyStyle.BALANCED, darts: [
    d("S18", Multiplier.S, "18", 18),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(59, { name: "S19 D20", style: StrategyStyle.BALANCED, darts: [
    d("S19", Multiplier.S, "19", 19),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(60, { name: "S20 D20", style: StrategyStyle.BALANCED, darts: [
    d("S20", Multiplier.S, "20", 20),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(61, { name: "SB D18", style: StrategyStyle.BALANCED, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(61, { name: "T15 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T15", Multiplier.T, "15", 45),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(62, { name: "T10 D16", style: StrategyStyle.BALANCED, darts: [
    d("T10", Multiplier.T, "10", 30),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(62, { name: "T14 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T14", Multiplier.T, "14", 42),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(63, { name: "T17 D6", style: StrategyStyle.BALANCED, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("D6", Multiplier.D, "6", 12)
  ] });
  add(63, { name: "S13 DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S13", Multiplier.S, "13", 13),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(64, { name: "T16 D8", style: StrategyStyle.BALANCED, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(64, { name: "T8 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T8", Multiplier.T, "8", 24),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(65, { name: "SB D20", style: StrategyStyle.BALANCED, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(65, { name: "T11 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T11", Multiplier.T, "11", 33),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(66, { name: "T10 D18", style: StrategyStyle.BALANCED, darts: [
    d("T10", Multiplier.T, "10", 30),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(66, { name: "T18 D6 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("D6", Multiplier.D, "6", 12)
  ] });
  add(67, { name: "T9 D20", style: StrategyStyle.BALANCED, darts: [
    d("T9", Multiplier.T, "9", 27),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(67, { name: "S17 DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S17", Multiplier.S, "17", 17),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(68, { name: "T12 D16", style: StrategyStyle.BALANCED, darts: [
    d("T12", Multiplier.T, "12", 36),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(68, { name: "T16 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(69, { name: "T19 D6", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D6", Multiplier.D, "6", 12)
  ] });
  add(69, { name: "T15 D12 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T15", Multiplier.T, "15", 45),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(70, { name: "T18 D8", style: StrategyStyle.BALANCED, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(70, { name: "T10 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T10", Multiplier.T, "10", 30),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(71, { name: "T13 D16", style: StrategyStyle.BALANCED, darts: [
    d("T13", Multiplier.T, "13", 39),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(71, { name: "T17 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(72, { name: "T16 D12", style: StrategyStyle.BALANCED, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(72, { name: "T12 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T12", Multiplier.T, "12", 36),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(73, { name: "T19 D8", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(73, { name: "T15 D14 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T15", Multiplier.T, "15", 45),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(74, { name: "T14 D16", style: StrategyStyle.BALANCED, darts: [
    d("T14", Multiplier.T, "14", 42),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(74, { name: "T16 D13 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D13", Multiplier.D, "13", 26)
  ] });
  add(75, { name: "T17 D12", style: StrategyStyle.BALANCED, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(75, { name: "SB DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(76, { name: "T16 D14", style: StrategyStyle.BALANCED, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(76, { name: "D18 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("D18", Multiplier.D, "18", 36),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(77, { name: "T19 D10", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(77, { name: "T15 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T15", Multiplier.T, "15", 45),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(78, { name: "T18 D12", style: StrategyStyle.BALANCED, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(79, { name: "T19 D11", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D11", Multiplier.D, "11", 22)
  ] });
  add(79, { name: "T13 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T13", Multiplier.T, "13", 39),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(80, { name: "T20 D10", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(80, { name: "D20 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("D20", Multiplier.D, "20", 40),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(81, { name: "T19 D12", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(81, { name: "T15 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T15", Multiplier.T, "15", 45),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(82, { name: "T14 D20", style: StrategyStyle.BALANCED, darts: [
    d("T14", Multiplier.T, "14", 42),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(82, { name: "DB D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.BULL, "25", 50),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(83, { name: "T17 D16", style: StrategyStyle.BALANCED, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(83, { name: "SB S18 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("S18", Multiplier.S, "18", 18),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(84, { name: "T20 D12", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(84, { name: "T16 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(85, { name: "T15 D20", style: StrategyStyle.BALANCED, darts: [
    d("T15", Multiplier.T, "15", 45),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(85, { name: "T19 D14 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(86, { name: "T18 D16", style: StrategyStyle.BALANCED, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(87, { name: "T17 D18", style: StrategyStyle.BALANCED, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(88, { name: "T20 D14", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(88, { name: "T16 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(89, { name: "T19 D16", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(90, { name: "T20 D15", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D15", Multiplier.D, "15", 30)
  ] });
  add(91, { name: "T17 D20", style: StrategyStyle.BALANCED, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(91, { name: "SB T16 D9 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("T16", Multiplier.T, "16", 48),
    d("D9", Multiplier.D, "9", 18)
  ] });
  add(92, { name: "T20 D16", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(92, { name: "SB T17 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("T17", Multiplier.T, "17", 51),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(93, { name: "T19 D18", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(93, { name: "SB T18 D7 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("T18", Multiplier.T, "18", 54),
    d("D7", Multiplier.D, "7", 14)
  ] });
  add(94, { name: "T18 D20", style: StrategyStyle.BALANCED, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(94, { name: "SB T19 D6 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("T19", Multiplier.T, "19", 57),
    d("D6", Multiplier.D, "6", 12)
  ] });
  add(95, { name: "T19 D19", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D19", Multiplier.D, "19", 38)
  ] });
  add(95, { name: "S19 D19 D19 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S19", Multiplier.S, "19", 19),
    d("D19", Multiplier.D, "19", 38),
    d("D19", Multiplier.D, "19", 38)
  ] });
  add(96, { name: "T20 D18", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(97, { name: "T19 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(98, { name: "T20 D19", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D19", Multiplier.D, "19", 38)
  ] });
  add(99, { name: "T19 S10 D16", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S10", Multiplier.S, "10", 10),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(99, { name: "T17 S16 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("S16", Multiplier.S, "16", 16),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(100, { name: "T20 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(100, { name: "S20 D20 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S20", Multiplier.S, "20", 20),
    d("D20", Multiplier.D, "20", 40),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(101, { name: "T20 S9 D16", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S9", Multiplier.S, "9", 9),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(101, { name: "T20 S1 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S1", Multiplier.S, "1", 1),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(102, { name: "T16 S14 D20", style: StrategyStyle.BALANCED, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("S14", Multiplier.S, "14", 14),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(102, { name: "T20 S10 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S10", Multiplier.S, "10", 10),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(103, { name: "T19 S6 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S6", Multiplier.S, "6", 6),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(103, { name: "T19 S10 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S10", Multiplier.S, "10", 10),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(104, { name: "T16 S16 D20", style: StrategyStyle.BALANCED, darts: [
    d("T16", Multiplier.T, "16", 48),
    d("S16", Multiplier.S, "16", 16),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(104, { name: "T19 S15 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S15", Multiplier.S, "15", 15),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(105, { name: "T19 S8 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S8", Multiplier.S, "8", 8),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(105, { name: "T19 S16 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S16", Multiplier.S, "16", 16),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(106, { name: "T20 S6 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S6", Multiplier.S, "6", 6),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(106, { name: "T20 S10 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S10", Multiplier.S, "10", 10),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(107, { name: "T19 S10 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S10", Multiplier.S, "10", 10),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(108, { name: "T20 S8 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S8", Multiplier.S, "8", 8),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(108, { name: "T20 S16 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S16", Multiplier.S, "16", 16),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(109, { name: "T20 S9 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S9", Multiplier.S, "9", 9),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(109, { name: "T20 S17 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S17", Multiplier.S, "17", 17),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(110, { name: "T20 S10 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S10", Multiplier.S, "10", 10),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(110, { name: "T20 S18 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S18", Multiplier.S, "18", 18),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(111, { name: "T19 S14 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S14", Multiplier.S, "14", 14),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(111, { name: "T20 S11 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S11", Multiplier.S, "11", 11),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(112, { name: "T20 S12 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S12", Multiplier.S, "12", 12),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(112, { name: "T20 S20 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S20", Multiplier.S, "20", 20),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(113, { name: "T19 S16 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S16", Multiplier.S, "16", 16),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(113, { name: "T20 S13 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S13", Multiplier.S, "13", 13),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(114, { name: "T20 S14 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S14", Multiplier.S, "14", 14),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(114, { name: "T19 S17 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S17", Multiplier.S, "17", 17),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(115, { name: "T19 S18 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S18", Multiplier.S, "18", 18),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(115, { name: "T20 S15 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S15", Multiplier.S, "15", 15),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(116, { name: "T19 S19 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S19", Multiplier.S, "19", 19),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(116, { name: "T20 S16 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S16", Multiplier.S, "16", 16),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(117, { name: "T20 S17 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S17", Multiplier.S, "17", 17),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(117, { name: "T19 S20 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("S20", Multiplier.S, "20", 20),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(118, { name: "T20 S18 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S18", Multiplier.S, "18", 18),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(118, { name: "T17 T17 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("T17", Multiplier.T, "17", 51),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(119, { name: "T19 T12 D13", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T12", Multiplier.T, "12", 36),
    d("D13", Multiplier.D, "13", 26)
  ] });
  add(120, { name: "T20 S20 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S20", Multiplier.S, "20", 20),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(120, { name: "S20 DB DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("S20", Multiplier.S, "20", 20),
    d("Bull", Multiplier.BULL, "25", 50),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(121, { name: "T20 T11 D14", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T11", Multiplier.T, "11", 33),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(121, { name: "T17 T20 D5 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("T20", Multiplier.T, "20", 60),
    d("D5", Multiplier.D, "5", 10)
  ] });
  add(122, { name: "T18 T18 D7", style: StrategyStyle.BALANCED, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("T18", Multiplier.T, "18", 54),
    d("D7", Multiplier.D, "7", 14)
  ] });
  add(122, { name: "SB T19 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("T19", Multiplier.T, "19", 57),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(123, { name: "T19 T16 D9", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T16", Multiplier.T, "16", 48),
    d("D9", Multiplier.D, "9", 18)
  ] });
  add(124, { name: "T20 T14 D11", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T14", Multiplier.T, "14", 42),
    d("D11", Multiplier.D, "11", 22)
  ] });
  add(124, { name: "T20 D16 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D16", Multiplier.D, "16", 32),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(125, { name: "SB T20 D20", style: StrategyStyle.BALANCED, darts: [
    d("Bull", Multiplier.SBULL, "25", 25),
    d("T20", Multiplier.T, "20", 60),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(125, { name: "T18 T13 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("T13", Multiplier.T, "13", 39),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(126, { name: "T19 T19 D6", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T19", Multiplier.T, "19", 57),
    d("D6", Multiplier.D, "6", 12)
  ] });
  add(127, { name: "T20 T17 D8", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T17", Multiplier.T, "17", 51),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(127, { name: "T20 S17 DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("S17", Multiplier.S, "17", 17),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(128, { name: "T18 T14 D16", style: StrategyStyle.BALANCED, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("T14", Multiplier.T, "14", 42),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(128, { name: "T18 T18 D10 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("T18", Multiplier.T, "18", 54),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(129, { name: "T19 T16 D12", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T16", Multiplier.T, "16", 48),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(129, { name: "T19 T12 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T12", Multiplier.T, "12", 36),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(130, { name: "T20 T20 D5", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D5", Multiplier.D, "5", 10)
  ] });
  add(130, { name: "T19 T19 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T19", Multiplier.T, "19", 57),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(133, { name: "T20 T19 D8", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(133, { name: "T20 T15 D14 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T15", Multiplier.T, "15", 45),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(134, { name: "T20 T14 D16", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T14", Multiplier.T, "14", 42),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(134, { name: "T17 T17 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T17", Multiplier.T, "17", 51),
    d("T17", Multiplier.T, "17", 51),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(135, { name: "DB T15 D20", style: StrategyStyle.BALANCED, darts: [
    d("Bull", Multiplier.BULL, "25", 50),
    d("T15", Multiplier.T, "15", 45),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(135, { name: "T20 T17 D12 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T17", Multiplier.T, "17", 51),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(136, { name: "T20 T16 D14", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T16", Multiplier.T, "16", 48),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(136, { name: "T20 T20 D8 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D8", Multiplier.D, "8", 16)
  ] });
  add(137, { name: "T20 T19 D10", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(137, { name: "T20 T15 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T15", Multiplier.T, "15", 45),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(138, { name: "T20 T18 D12", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T18", Multiplier.T, "18", 54),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(138, { name: "T19 T19 D12 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T19", Multiplier.T, "19", 57),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(139, { name: "T19 T14 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T14", Multiplier.T, "14", 42),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(139, { name: "T20 T13 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T13", Multiplier.T, "13", 39),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(140, { name: "T20 T20 D10", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D10", Multiplier.D, "10", 20)
  ] });
  add(140, { name: "T20 D20 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("D20", Multiplier.D, "20", 40),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(141, { name: "T20 T19 D12", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(141, { name: "T20 T15 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T15", Multiplier.T, "15", 45),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(142, { name: "T20 T14 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T14", Multiplier.T, "14", 42),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(142, { name: "T19 T15 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T15", Multiplier.T, "15", 45),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(143, { name: "T20 T17 D16", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T17", Multiplier.T, "17", 51),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(143, { name: "T19 T18 D16 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T18", Multiplier.T, "18", 54),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(144, { name: "T20 T20 D12", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D12", Multiplier.D, "12", 24)
  ] });
  add(144, { name: "T18 T18 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("T18", Multiplier.T, "18", 54),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(145, { name: "T20 T15 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T15", Multiplier.T, "15", 45),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(145, { name: "T20 T19 D14 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(147, { name: "T20 T17 D18", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T17", Multiplier.T, "17", 51),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(147, { name: "T19 T18 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T18", Multiplier.T, "18", 54),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(148, { name: "T20 T20 D14", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D14", Multiplier.D, "14", 28)
  ] });
  add(148, { name: "T20 T16 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T16", Multiplier.T, "16", 48),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(149, { name: "T20 T19 D16", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(150, { name: "T19 T19 D18", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T19", Multiplier.T, "19", 57),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(150, { name: "T20 T18 D18 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T18", Multiplier.T, "18", 54),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(151, { name: "T20 T17 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T17", Multiplier.T, "17", 51),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(151, { name: "T19 T18 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T18", Multiplier.T, "18", 54),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(152, { name: "T20 T20 D16", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D16", Multiplier.D, "16", 32)
  ] });
  add(153, { name: "T20 T19 D18", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(154, { name: "T19 T19 D20", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T19", Multiplier.T, "19", 57),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(154, { name: "T20 T18 D20 (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T18", Multiplier.T, "18", 54),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(155, { name: "T20 T19 D19", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D19", Multiplier.D, "19", 38)
  ] });
  add(156, { name: "T20 T20 D18", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D18", Multiplier.D, "18", 36)
  ] });
  add(157, { name: "T20 T19 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(158, { name: "T20 T20 D19", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D19", Multiplier.D, "19", 38)
  ] });
  add(158, { name: "T18 T18 DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T18", Multiplier.T, "18", 54),
    d("T18", Multiplier.T, "18", 54),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(160, { name: "T20 T20 D20", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("D20", Multiplier.D, "20", 40)
  ] });
  add(161, { name: "T20 T17 DB", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T17", Multiplier.T, "17", 51),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(161, { name: "T19 T18 DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T18", Multiplier.T, "18", 54),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(164, { name: "T19 T19 DB", style: StrategyStyle.BALANCED, darts: [
    d("T19", Multiplier.T, "19", 57),
    d("T19", Multiplier.T, "19", 57),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(164, { name: "T20 T18 DB (alt)", style: StrategyStyle.ALTERNATIVE, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T18", Multiplier.T, "18", 54),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(167, { name: "T20 T19 DB", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T19", Multiplier.T, "19", 57),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  add(170, { name: "T20 T20 DB", style: StrategyStyle.BALANCED, darts: [
    d("T20", Multiplier.T, "20", 60),
    d("T20", Multiplier.T, "20", 60),
    d("Bull", Multiplier.BULL, "25", 50)
  ] });
  return m;
}

async function insertAndVerify(score: number, route: CheckoutRoute, priority: number): Promise<{ ok: boolean; reason?: string }> {
  const err = validateRoute(score, route);
  if (err) return { ok: false, reason: `validate: ${err}` };

  const strategy = await prisma.strategy.create({
    data: {
      startScore: score,
      name: route.name,
      priority,
      strategyType: StrategyType.CHECKOUT,
      style: route.style,
      skillLevel: "general",
      description: `${score} checkout: ${route.darts.map(x => x.target).join(" → ")}`,
      isPublished: true,
      darts: { create: route.darts.map((x, i) => ({ dartIndex: i + 1, ...x })) },
      outcomes: { create: [{
        label: route.darts.map(x => x.target).join(" "),
        scoredPoints: score,
        resultScore: 0,
        resultType: ResultType.CHECKOUT,
        explanation: `Checkout: ${route.darts.map(x => x.target).join(" → ")}`
      }]}
    }
  });

  const v = await prisma.strategy.findUnique({
    where: { id: strategy.id },
    include: { darts: { orderBy: { dartIndex: "asc" } }, outcomes: true }
  });
  if (!v) return { ok: false, reason: "not found after insert" };

  const dartSum = v.darts.reduce((a, x) => a + x.points, 0);
  const lastDart = v.darts[v.darts.length - 1];
  const lastValid = lastDart.multiplier === "D" || lastDart.multiplier === "BULL";
  const countOk = v.darts.length === route.darts.length;
  const outcomeOk = v.outcomes.some(o =>
    o.resultType === ResultType.CHECKOUT && o.resultScore === 0 && o.scoredPoints === score
  );

  if (dartSum === score && lastValid && countOk && outcomeOk) {
    return { ok: true };
  }
  return { ok: false, reason: `verify sum=${dartSum} lastValid=${lastValid} count=${countOk} outcome=${outcomeOk}` };
}

async function seedFullCheckouts() {
  const map = buildCheckouts();
  let okCount = 0;
  let failCount = 0;
  const failures: Array<{ score: number; name: string; reason: string }> = [];

  const entries = [...map.entries()].sort((a, b) => a[0] - b[0]);
  for (const [score, routes] of entries) {
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const result = await insertAndVerify(score, route, i + 1);
      if (result.ok) {
        okCount++;
        const dartStr = route.darts.map(x => x.target).join(" → ");
        console.log(`✓ ${String(score).padStart(3)} → ${dartStr}`);
      } else {
        failCount++;
        failures.push({ score, name: route.name, reason: result.reason ?? "?" });
        console.error(`✗ ${String(score).padStart(3)} → ${route.name}: ${result.reason}`);
      }
    }
  }

  console.log(`\n=== Full checkouts: ${okCount} inserted/verified, ${failCount} failed ===`);
  if (failures.length > 0) {
    console.error("Failures:");
    for (const f of failures) console.error(`  - ${f.score} ${f.name}: ${f.reason}`);
  }
}

async function main() {
  await seedScores();
  await seedStrategies();
  await seedFullCheckouts();
  console.log("Seed complete: scores 0–501, legacy strategies for 108, 40, 32, and full checkout table.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
