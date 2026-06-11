import { ScoreSlider } from "@/components/strategy-screen/ScoreSlider";
import { StrategyRubric } from "@/components/strategy-screen/StrategyRubric";
import { HistoryBreadcrumb } from "@/components/strategy-screen/HistoryBreadcrumb";
import { getStrategyScreenData } from "@/lib/darts/strategy-service";

type PageProps = {
  searchParams: Promise<{ score?: string; h?: string }>;
};

function parseScore(value: string | undefined) {
  const parsed = Number(value ?? "108");
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 501) return 108;
  return parsed;
}

function parseHistory(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 501)
    .slice(0, 10);
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentScore = parseScore(params?.score);
  const history = parseHistory(params?.h);
  const data = await getStrategyScreenData(currentScore);

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div>
            <span className="badge">Darts kiszálló-stratégia</span>
            <h1>Kiszálló képernyő</h1>
            <p>
              Húzd a sávot a kívánt score-hoz, vagy kattints a számokra. A kiemelt rublika a
              legjobb megoldás, a többi alternatív. A lenyíló panelek a szektorcseréket és a
              mentőágakat mutatják.
            </p>
          </div>
        </header>

        <HistoryBreadcrumb history={history} currentScore={currentScore} />

        <ScoreSlider currentScore={currentScore} history={history} />

        <section className="rubrics">
          {!data ? (
            <div className="empty">
              <h2 className="error">A score nem található az adatbázisban.</h2>
              <p>Futtasd a migrációt és a seed scriptet.</p>
            </div>
          ) : data.strategies.length === 0 ? (
            <div className="empty">
              <h2>Ehhez a score-hoz nincs kiszálló.</h2>
              <p>
                A {currentScore} egy bogey szám vagy nincs 3-nyilas megoldása.
              </p>
            </div>
          ) : (
            data.strategies.map((strategy, idx) => (
              <StrategyRubric
                key={strategy.id}
                index={idx + 1}
                strategyId={strategy.id}
                name={strategy.name}
                style={strategy.style}
                description={strategy.description}
                darts={strategy.darts}
                outcomes={strategy.outcomes}
                targetScore={currentScore}
                isPrimary={idx === 0}
                history={history}
                forceOpen={idx === 0}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
