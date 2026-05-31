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

  await prisma.strategy.create({
    data: {
      startScore: 108,
      name: "19-es kezdés",
      priority: 1,
      strategyType: StrategyType.CHECKOUT,
      style: StrategyStyle.SAFE,
      skillLevel: "general",
      description: "108-ra biztonságos, jól menthető útvonal. A fő ág T19 S19 D16, de több hasznos hibaág is 40 vagy 32 környékére vezet.",
      isPublished: true,
      darts: {
        create: [
          { dartIndex: 1, target: "T19", multiplier: Multiplier.T, segment: "19", points: 57 },
          { dartIndex: 2, target: "S19", multiplier: Multiplier.S, segment: "19", points: 19 },
          { dartIndex: 3, target: "D16", multiplier: Multiplier.D, segment: "16", points: 32 }
        ]
      },
      outcomes: {
        create: [
          { label: "T19 S19 D16", scoredPoints: 108, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "Tiszta checkout D16-tal." },
          { label: "S19 T19 D16", scoredPoints: 108, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "Az első szimpla után még menthető ugyanarra a lezárásra." },
          { label: "S19 S19 T10", scoredPoints: 68, resultScore: 40, resultType: ResultType.NEXT_SCORE, nextScore: 40, explanation: "Setup jellegű ág: 40 marad, ami D20." },
          { label: "T19 S7 S4", scoredPoints: 68, resultScore: 40, resultType: ResultType.NEXT_SCORE, nextScore: 40, explanation: "Szektorhiba utáni mentőág 40-re." },
          { label: "T19 S3 S16", scoredPoints: 76, resultScore: 32, resultType: ResultType.NEXT_SCORE, nextScore: 32, explanation: "D16-barát mentőág." }
        ]
      }
    }
  });

  await prisma.strategy.create({
    data: {
      startScore: 108,
      name: "20-as kezdés",
      priority: 2,
      strategyType: StrategyType.CHECKOUT,
      style: StrategyStyle.BALANCED,
      skillLevel: "general",
      description: "Természetes T20-vonal azoknak, akik a 20-as szektort preferálják.",
      isPublished: true,
      darts: {
        create: [
          { dartIndex: 1, target: "T20", multiplier: Multiplier.T, segment: "20", points: 60 },
          { dartIndex: 2, target: "S16", multiplier: Multiplier.S, segment: "16", points: 16 },
          { dartIndex: 3, target: "D16", multiplier: Multiplier.D, segment: "16", points: 32 }
        ]
      },
      outcomes: {
        create: [
          { label: "T20 S16 D16", scoredPoints: 108, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "Tiszta checkout D16-tal." },
          { label: "T20 S8 D20", scoredPoints: 108, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "D20-ra záró alternatíva." },
          { label: "S20 T20 D14", scoredPoints: 108, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "Első szimpla 20 után is van közvetlen checkout." },
          { label: "S20 S20 S20", scoredPoints: 60, resultScore: 48, resultType: ResultType.NEXT_SCORE, nextScore: 48, explanation: "Három szimpla 20 után 48 marad." }
        ]
      }
    }
  });

  await prisma.strategy.create({
    data: {
      startScore: 40,
      name: "D20 lezárás",
      priority: 1,
      strategyType: StrategyType.CHECKOUT,
      style: StrategyStyle.BALANCED,
      description: "Egy nyilas klasszikus checkout.",
      isPublished: true,
      darts: {
        create: [{ dartIndex: 1, target: "D20", multiplier: Multiplier.D, segment: "20", points: 40 }]
      },
      outcomes: {
        create: [{ label: "D20", scoredPoints: 40, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "Checkout D20-szal." }]
      }
    }
  });

  await prisma.strategy.create({
    data: {
      startScore: 32,
      name: "D16 lezárás",
      priority: 1,
      strategyType: StrategyType.CHECKOUT,
      style: StrategyStyle.SAFE,
      description: "D16-ra záró alap checkout.",
      isPublished: true,
      darts: {
        create: [{ dartIndex: 1, target: "D16", multiplier: Multiplier.D, segment: "16", points: 32 }]
      },
      outcomes: {
        create: [{ label: "D16", scoredPoints: 32, resultScore: 0, resultType: ResultType.CHECKOUT, explanation: "Checkout D16-tal." }]
      }
    }
  });
}

async function main() {
  await seedScores();
  await seedStrategies();
  console.log("Seed complete: scores 0–501 plus sample strategies for 108, 40 and 32.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
