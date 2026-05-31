import { prisma } from "@/lib/db/prisma";

export async function getStrategyScreenData(scoreValue: number) {
  return prisma.score.findUnique({
    where: { score: scoreValue },
    include: {
      strategies: {
        where: { isPublished: true },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        include: {
          darts: { orderBy: { dartIndex: "asc" } },
          outcomes: { orderBy: [{ resultType: "asc" }, { label: "asc" }] }
        }
      }
    }
  });
}
