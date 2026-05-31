import type { Strategy, StrategyDart, StrategyOutcome } from "@prisma/client";

type StrategyWithDetails = Strategy & {
  darts: StrategyDart[];
  outcomes: StrategyOutcome[];
};

export function StrategyCard({ strategy }: { strategy: StrategyWithDetails }) {
  return (
    <article className="card">
      <div className="card-header">
        <div className="priority">{strategy.priority}</div>
        <div>
          <h2>{strategy.name}</h2>
          <div className="meta">
            <span className="pill">{strategy.strategyType}</span>
            {strategy.style ? <span className="pill">{strategy.style}</span> : null}
            {strategy.skillLevel ? <span className="pill">{strategy.skillLevel}</span> : null}
          </div>
          {strategy.description ? <p className="meta">{strategy.description}</p> : null}
        </div>
      </div>

      <div className="section-title">Tervezett dobássor</div>
      <div className="dart-row">
        {strategy.darts.map((dart) => (
          <div className="dart" key={dart.id}>
            {dart.target}
            <small>{dart.points} pont</small>
          </div>
        ))}
      </div>

      <div className="section-title">Lehetséges outcome-ok</div>
      <div className="outcome-row">
        {strategy.outcomes.map((outcome) => (
          <div className="outcome" key={outcome.id}>
            <div>
              <strong>{outcome.label}</strong>
              <p>
                {outcome.scoredPoints} pont dobva → {outcome.resultScore} marad · {outcome.resultType}
              </p>
              {outcome.explanation ? <p>{outcome.explanation}</p> : null}
            </div>
            {outcome.resultType === "CHECKOUT" ? (
              <span className="checkout">checkout</span>
            ) : outcome.nextScore !== null ? (
              <a className="next" href={`/?score=${outcome.nextScore}`}>
                {outcome.nextScore} →
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
