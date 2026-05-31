import { ScoreToolbar } from "@/components/strategy-screen/ScoreToolbar";
import { StrategyCard } from "@/components/strategy-screen/StrategyCard";
import { getStrategyScreenData } from "@/lib/darts/strategy-service";

type PageProps = {
  searchParams?: Promise<{ score?: string }> | { score?: string };
};

async function resolveSearchParams(searchParams: PageProps["searchParams"]) {
  return searchParams instanceof Promise ? await searchParams : searchParams;
}

function parseScore(value: string | undefined) {
  const parsed = Number(value ?? "108");
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 501) return 108;
  return parsed;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await resolveSearchParams(searchParams);
  const currentScore = parseScore(params?.score);
  const data = await getStrategyScreenData(currentScore);

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div>
            <span className="badge">Darts stratégia / kiszállótábla</span>
            <h1>Score-alapú stratégia képernyő</h1>
            <p>
              Az első verzió egyetlen képernyő: score kiválasztása, stratégiai verziók, tervezett dobások és outcome-alapú navigáció más score-okra.
            </p>
          </div>
          <div className="score-hero">
            <strong>{currentScore}</strong>
            <span>{data?.category ?? "nincs adat"}</span>
          </div>
        </header>

        <ScoreToolbar currentScore={currentScore} />

        <section className="main-grid">
          <div className="cards">
            {!data ? (
              <div className="empty">
                <h2 className="error">A score nem található az adatbázisban.</h2>
                <p>Futtasd a migrációt és a seed scriptet.</p>
              </div>
            ) : data.strategies.length === 0 ? (
              <div className="empty">
                <h2>Ehhez a score-hoz még nincs publikált stratégia.</h2>
                <p>A score létezik az adatbázisban, de stratégiai adat még nincs feltöltve.</p>
              </div>
            ) : (
              data.strategies.map((strategy) => <StrategyCard key={strategy.id} strategy={strategy} />)
            )}
          </div>

          <aside className="sidebar">
            <div className="side-card">
              <h3>Aktuális scope</h3>
              <p>Most csak ez az egy stratégia képernyő és az adatbázis készül. Nincs gyakorló mód, nincs auth, nincs statisztika.</p>
            </div>
            <div className="side-card">
              <h3>Adatmodell</h3>
              <p>scores → strategies → strategy_darts / strategy_outcomes. Az outcome next_score mezővel kapcsolódhat más score-hoz.</p>
            </div>
            <div className="side-card">
              <h3>Kezdő mintaadat</h3>
              <p>A seed jelenleg 0–501 score-t, valamint 108, 40 és 32 stratégiai mintákat tölt be.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
