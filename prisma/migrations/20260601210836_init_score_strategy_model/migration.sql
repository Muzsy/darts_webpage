-- CreateEnum
CREATE TYPE "ScoreCategory" AS ENUM ('NORMAL', 'CHECKOUT_POSSIBLE', 'BOGEY', 'TERMINAL', 'BUST_LIKE');

-- CreateEnum
CREATE TYPE "StrategyType" AS ENUM ('SCORING', 'SETUP', 'CHECKOUT', 'RECOVERY', 'PRACTICE');

-- CreateEnum
CREATE TYPE "StrategyStyle" AS ENUM ('AGGRESSIVE', 'SAFE', 'BALANCED', 'BEGINNER_FRIENDLY', 'PRO', 'ALTERNATIVE');

-- CreateEnum
CREATE TYPE "Multiplier" AS ENUM ('S', 'D', 'T', 'SBULL', 'BULL');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('CHECKOUT', 'NEXT_SCORE', 'SETUP', 'BUST', 'NO_SCORE', 'INVALID');

-- CreateTable
CREATE TABLE "scores" (
    "score" INTEGER NOT NULL,
    "category" "ScoreCategory" NOT NULL,
    "title" TEXT,
    "note" TEXT,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("score")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" UUID NOT NULL,
    "startScore" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "strategyType" "StrategyType" NOT NULL,
    "skillLevel" TEXT,
    "style" "StrategyStyle",
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_darts" (
    "id" UUID NOT NULL,
    "strategyId" UUID NOT NULL,
    "dartIndex" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "multiplier" "Multiplier" NOT NULL,
    "segment" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "strategy_darts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_outcomes" (
    "id" UUID NOT NULL,
    "strategyId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "scoredPoints" INTEGER NOT NULL,
    "resultScore" INTEGER NOT NULL,
    "resultType" "ResultType" NOT NULL,
    "nextScore" INTEGER,
    "explanation" TEXT,

    CONSTRAINT "strategy_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strategies_startScore_priority_idx" ON "strategies"("startScore", "priority");

-- CreateIndex
CREATE INDEX "strategy_darts_strategyId_idx" ON "strategy_darts"("strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "strategy_darts_strategyId_dartIndex_key" ON "strategy_darts"("strategyId", "dartIndex");

-- CreateIndex
CREATE INDEX "strategy_outcomes_strategyId_idx" ON "strategy_outcomes"("strategyId");

-- CreateIndex
CREATE INDEX "strategy_outcomes_nextScore_idx" ON "strategy_outcomes"("nextScore");

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_startScore_fkey" FOREIGN KEY ("startScore") REFERENCES "scores"("score") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_darts" ADD CONSTRAINT "strategy_darts_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_outcomes" ADD CONSTRAINT "strategy_outcomes_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_outcomes" ADD CONSTRAINT "strategy_outcomes_nextScore_fkey" FOREIGN KEY ("nextScore") REFERENCES "scores"("score") ON DELETE SET NULL ON UPDATE CASCADE;
