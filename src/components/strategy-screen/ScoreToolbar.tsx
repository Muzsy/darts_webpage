const quickScores = [501, 321, 170, 167, 164, 108, 80, 60, 40, 32];

export function ScoreToolbar({ currentScore }: { currentScore: number }) {
  return (
    <div className="toolbar">
      <form action="/" method="get">
        <label htmlFor="score">Score</label>
        <input id="score" name="score" type="number" min="0" max="501" defaultValue={currentScore} />
        <button type="submit">Megnyitás</button>
      </form>

      {quickScores.map((score) => (
        <a key={score} className="quick-link" href={`/?score=${score}`}>
          {score}
        </a>
      ))}
    </div>
  );
}
