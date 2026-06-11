'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { ScoreCategory, StrategyType, StrategyStyle, Multiplier, ResultType } from '@prisma/client'

export type StrategyInput = {
  startScore: number
  name: string
  priority?: number
  strategyType: StrategyType
  skillLevel?: string | null
  style?: StrategyStyle | null
  description?: string | null
  isPublished?: boolean
  darts: DartInput[]
  outcomes: OutcomeInput[]
}

export type DartInput = {
  dartIndex: number
  target: string
  multiplier: Multiplier
  segment: string
  points: number
  isOptional?: boolean
}

export type OutcomeInput = {
  label: string
  scoredPoints: number
  resultScore: number
  resultType: ResultType
  nextScore?: number | null
  explanation?: string | null
}

export type ScoreInput = {
  score: number
  category: ScoreCategory
  title?: string | null
  note?: string | null
}

export async function getScoreWithStrategies(score: number) {
  return prisma.score.findUnique({
    where: { score },
    include: {
      strategies: {
        include: {
          darts: { orderBy: { dartIndex: 'asc' } },
          outcomes: { orderBy: { label: 'asc' } }
        }
      }
    }
  })
}

export async function getAllScores() {
  return prisma.score.findMany({
    orderBy: { score: 'asc' },
    select: { score: true, category: true, title: true }
  })
}

export async function createOrUpdateScore(data: ScoreInput) {
  const { score, ...rest } = data
  await prisma.score.upsert({
    where: { score },
    update: rest,
    create: data
  })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function createStrategy(data: StrategyInput) {
  const { darts, outcomes, ...strategyData } = data

  const strategy = await prisma.strategy.create({
    data: {
      ...strategyData,
      darts: {
        create: darts
      },
      outcomes: {
        create: outcomes.map(o => ({
          ...o,
          nextScore: o.nextScore ?? null
        }))
      }
    }
  })

  revalidatePath('/admin')
  revalidatePath('/')
  return strategy
}

export async function updateStrategy(strategyId: string, data: StrategyInput) {
  const { darts, outcomes, ...strategyData } = data

  await prisma.$transaction(async (tx) => {
    await tx.strategy.update({
      where: { id: strategyId },
      data: strategyData
    })

    await tx.strategyDart.deleteMany({ where: { strategyId } })
    await tx.strategyDart.createMany({
      data: darts.map(d => ({ ...d, strategyId }))
    })

    await tx.strategyOutcome.deleteMany({ where: { strategyId } })
    await tx.strategyOutcome.createMany({
      data: outcomes.map(o => ({
        ...o,
        strategyId,
        nextScore: o.nextScore ?? null
      }))
    })
  })

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteStrategy(strategyId: string) {
  await prisma.strategy.delete({ where: { id: strategyId } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function togglePublish(strategyId: string) {
  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
    select: { isPublished: true }
  })
  await prisma.strategy.update({
    where: { id: strategyId },
    data: { isPublished: !strategy?.isPublished }
  })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteScore(score: number) {
  await prisma.score.delete({ where: { score } })
  revalidatePath('/admin')
  revalidatePath('/')
}