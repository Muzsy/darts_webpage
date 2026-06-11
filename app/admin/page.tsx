'use client'

import { useState, useEffect } from 'react'
import { ScoreCategory, StrategyType, StrategyStyle, Multiplier, ResultType } from '@prisma/client'
import { getAllScores, createOrUpdateScore, createStrategy, updateStrategy, deleteStrategy, togglePublish, getScoreWithStrategies, type StrategyInput, type DartInput, type OutcomeInput } from '@/lib/admin/actions'

type ScoreData = Awaited<ReturnType<typeof getScoreWithStrategies>>
type AllScoresData = Awaited<ReturnType<typeof getAllScores>>

const CATEGORIES: ScoreCategory[] = ['NORMAL', 'CHECKOUT_POSSIBLE', 'BOGEY', 'TERMINAL', 'BUST_LIKE']
const TYPES: StrategyType[] = ['SCORING', 'SETUP', 'CHECKOUT', 'RECOVERY', 'PRACTICE']
const STYLES: StrategyStyle[] = ['AGGRESSIVE', 'SAFE', 'BALANCED', 'BEGINNER_FRIENDLY', 'PRO', 'ALTERNATIVE']
const MULTIPLIERS: Multiplier[] = ['S', 'D', 'T']
const BULL_TARGETS = ['SBULL', 'BULL']
const RESULT_TYPES: ResultType[] = ['CHECKOUT', 'NEXT_SCORE', 'SETUP', 'BUST', 'NO_SCORE', 'INVALID']

const SEGMENTS = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','25']

export default function AdminPage() {
  const [allScores, setAllScores] = useState<AllScoresData>([])
  const [selectedScore, setSelectedScore] = useState(108)
  const [scoreData, setScoreData] = useState<ScoreData>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    getAllScores().then(setAllScores)
  }, [])

  useEffect(() => {
    setLoading(true)
    getScoreWithStrategies(selectedScore).then(data => {
      setScoreData(data)
      setLoading(false)
    })
  }, [selectedScore])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="container">
      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="admin-header">
        <h1>Stratégia Admin</h1>
        <p>Válassz egy score-t, majd szerkeszd a hozzá tartozó stratégiákat.</p>
      </div>

      <div className="admin-grid">
        <div className="score-panel">
          <h2>Score kiválasztása</h2>
          <div className="score-grid">
            <input
              type="number"
              min="0"
              max="501"
              value={selectedScore}
              onChange={e => setSelectedScore(Number(e.target.value))}
              className="score-input"
            />
            <div className="score-buttons">
              {[501, 321, 170, 167, 164, 108, 80, 60, 40, 32, 0].map(s => (
                <button key={s} onClick={() => setSelectedScore(s)} className={selectedScore === s ? 'active' : ''}>{s}</button>
              ))}
            </div>
          </div>

          {scoreData && (
            <ScoreEditor
              score={scoreData}
              onSave={async (data) => {
                setSaving(true)
                try {
                  await createOrUpdateScore(data)
                  const updated = await getScoreWithStrategies(selectedScore)
                  setScoreData(updated)
                  showMessage('success', 'Score mentve')
                } catch {
                  showMessage('error', 'Hiba a mentés során')
                }
                setSaving(false)
              }}
            />
          )}
        </div>

        <div className="strategies-panel">
          <h2>Stratégiák ({scoreData?.strategies.length ?? 0})</h2>

          {loading ? (
            <p className="loading">Betöltés...</p>
          ) : !scoreData ? (
            <p className="info">A score még nem létezik az adatbázisban. Mentés után létrejön.</p>
          ) : (
            <div className="strategies-list">
              {scoreData.strategies.map(strategy => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  startScore={selectedScore}
                  onSave={async (data) => {
                    setSaving(true)
                    try {
                      await updateStrategy(strategy.id, data)
                      const updated = await getScoreWithStrategies(selectedScore)
                      setScoreData(updated)
                      showMessage('success', 'Stratégia mentve')
                    } catch {
                      showMessage('error', 'Hiba a mentés során')
                    }
                    setSaving(false)
                  }}
                  onDelete={async () => {
                    if (!confirm('Törlöd a stratégiát?')) return
                    setSaving(true)
                    try {
                      await deleteStrategy(strategy.id)
                      const updated = await getScoreWithStrategies(selectedScore)
                      setScoreData(updated)
                      showMessage('success', 'Stratégia törölve')
                    } catch {
                      showMessage('error', 'Hiba a törlés során')
                    }
                    setSaving(false)
                  }}
                  onToggle={async () => {
                    await togglePublish(strategy.id)
                    const updated = await getScoreWithStrategies(selectedScore)
                    setScoreData(updated)
                  }}
                />
              ))}
            </div>
          )}

          {scoreData && (
            <div className="add-strategy">
              <h3>Új stratégia hozzáadása</h3>
              <StrategyForm
                startScore={selectedScore}
                onSave={async (data) => {
                  setSaving(true)
                  try {
                    await createStrategy(data)
                    const updated = await getScoreWithStrategies(selectedScore)
                    setScoreData(updated)
                    showMessage('success', 'Stratégia létrehozva')
                  } catch {
                    showMessage('error', 'Hiba a létrehozás során')
                  }
                  setSaving(false)
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .container { max-width: 1200px; margin: 0 auto; }
        .admin-header { margin-bottom: 24px; }
        .admin-header h1 { margin: 0 0 8px; }
        .admin-header p { margin: 0; color: var(--muted); }
        .admin-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
        .score-panel, .strategies-panel { background: var(--panel); border: 1px solid var(--border); border-radius: 20px; padding: 20px; }
        .score-panel h2, .strategies-panel h2 { margin: 0 0 16px; font-size: 16px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .score-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--panel-2); color: var(--text); font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 12px; }
        .score-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
        .score-buttons button { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--panel-2); color: var(--text); cursor: pointer; font-size: 13px; }
        .score-buttons button.active { border-color: var(--accent); background: rgba(52,211,153,0.15); color: var(--accent); }
        .message { position: fixed; top: 16px; right: 16px; padding: 12px 20px; border-radius: 12px; font-weight: 600; z-index: 100; }
        .message.success { background: rgba(52,211,153,0.2); color: var(--accent); border: 1px solid var(--accent); }
        .message.error { background: rgba(251,113,133,0.2); color: var(--danger); border: 1px solid var(--danger); }
        .strategies-list { display: grid; gap: 16px; margin-bottom: 24px; }
        .add-strategy { border-top: 1px solid var(--border); padding-top: 20px; margin-top: 20px; }
        .add-strategy h3 { margin: 0 0 16px; font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .loading, .info { color: var(--muted); font-style: italic; }
        form { display: grid; gap: 16px; }
        label { display: grid; gap: 6px; font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        input, select, textarea { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--panel-2); color: var(--text); }
        textarea { resize: vertical; min-height: 60px; }
        .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
        button[type="submit"] { padding: 10px 20px; border-radius: 10px; border: none; background: var(--accent); color: var(--panel-2); font-weight: 700; cursor: pointer; }
        button[type="submit"]:hover { opacity: 0.9; }
        button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--panel-2); color: var(--text); cursor: pointer; }
        .btn-danger { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--danger); background: transparent; color: var(--danger); cursor: pointer; }
        .btn-publish { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--accent-2); background: transparent; color: var(--accent-2); cursor: pointer; }
        .strategy-card { border: 1px solid var(--border); border-radius: 16px; padding: 16px; background: var(--panel-2); }
        .strategy-card .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .strategy-card h3 { margin: 0; font-size: 16px; }
        .strategy-card .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
        .strategy-card .badge { font-size: 11px; padding: 3px 8px; border-radius: 8px; background: var(--panel); border: 1px solid var(--border); }
        .strategy-card .badge.published { border-color: var(--accent); color: var(--accent); }
        .strategy-card .badge.draft { border-color: var(--muted); color: var(--muted); }
        .dart-list, .outcome-list { display: grid; gap: 6px; margin: 12px 0; }
        .dart-item, .outcome-item { display: flex; gap: 8px; align-items: center; padding: 8px; border-radius: 8px; background: var(--panel); border: 1px solid var(--border); font-size: 14px; }
        .sub-form { padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--panel); }
        .sub-form h4 { margin: 0 0 10px; font-size: 13px; color: var(--accent-2); text-transform: uppercase; letter-spacing: 0.05em; }
        @media (max-width: 800px) { .admin-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}

function ScoreEditor({ score, onSave }: { score: NonNullable<ScoreData>; onSave: (data: any) => Promise<void> }) {
  const [category, setCategory] = useState(score.category)
  const [title, setTitle] = useState(score.title ?? '')
  const [note, setNote] = useState(score.note ?? '')

  return (
    <form onSubmit={async (e) => {
      e.preventDefault()
      await onSave({ score: score.score, category, title: title || null, note: note || null })
    }}>
      <h3 style={{ margin: '20px 0 12px', fontSize: '14px', color: 'var(--accent-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score adatok</h3>
      <label>
        Kategória
        <select value={category} onChange={e => setCategory(e.target.value as ScoreCategory)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>
        Cím (opcionális)
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="pl. Checkout" />
      </label>
      <label>
        Megjegyzés (opcionális)
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="pl. Klasszikus bogey szám" />
      </label>
      <button type="submit">Score mentése</button>
    </form>
  )
}

function StrategyCard({ strategy, startScore, onSave, onDelete, onToggle }: {
  strategy: any
  startScore: number
  onSave: (data: StrategyInput) => Promise<void>
  onDelete: () => void
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="strategy-card">
      <div className="card-header">
        <div>
          <h3>{strategy.name}</h3>
          <div className="meta">
            <span className="badge">{strategy.strategyType}</span>
            {strategy.style && <span className="badge">{strategy.style}</span>}
            <span className={`badge ${strategy.isPublished ? 'published' : 'draft'}`}>
              {strategy.isPublished ? 'Publikált' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="btn-row">
          <button type="button" className="btn-publish" onClick={onToggle}>
            {strategy.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Bezár' : 'Szerkeszt'}
          </button>
          <button type="button" className="btn-danger" onClick={onDelete}>Törlés</button>
        </div>
      </div>

      {expanded && (
        <StrategyForm
          startScore={startScore}
          initialData={strategy}
          onSave={onSave}
          onCancel={() => setExpanded(false)}
        />
      )}
    </div>
  )
}

function StrategyForm({ startScore, initialData, onSave, onCancel }: {
  startScore: number
  initialData?: any
  onSave: (data: StrategyInput) => Promise<void>
  onCancel?: () => void
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [priority, setPriority] = useState(initialData?.priority ?? 1)
  const [strategyType, setStrategyType] = useState<StrategyType>(initialData?.strategyType ?? 'CHECKOUT')
  const [style, setStyle] = useState<StrategyStyle | ''>(initialData?.style ?? '')
  const [skillLevel, setSkillLevel] = useState(initialData?.skillLevel ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [darts, setDarts] = useState<DartInput[]>(initialData?.darts?.map((d: any) => ({
    dartIndex: d.dartIndex,
    target: d.target,
    multiplier: d.multiplier,
    segment: d.segment,
    points: d.points,
    isOptional: d.isOptional
  })) ?? [{ dartIndex: 1, target: 'S20', multiplier: 'S', segment: '20', points: 20, isOptional: false }])
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>(initialData?.outcomes?.map((o: any) => ({
    label: o.label,
    scoredPoints: o.scoredPoints,
    resultScore: o.resultScore,
    resultType: o.resultType,
    nextScore: o.nextScore,
    explanation: o.explanation
  })) ?? [{ label: '', scoredPoints: startScore, resultScore: 0, resultType: 'CHECKOUT', nextScore: null, explanation: '' }])

  const addDart = () => {
    if (darts.length >= 3) return
    setDarts([...darts, { dartIndex: darts.length + 1, target: 'S20', multiplier: 'S', segment: '20', points: 20, isOptional: false }])
  }

  const addBullDart = () => {
    if (darts.length >= 3) return
    setDarts([...darts, { dartIndex: darts.length + 1, target: 'SBULL', multiplier: 'S', segment: 'SBULL', points: 25, isOptional: false }])
  }

  const removeDart = (index: number) => {
    setDarts(darts.filter((_, i) => i !== index).map((d, i) => ({ ...d, dartIndex: i + 1 })))
  }

  const updateDart = (index: number, field: keyof DartInput, value: any) => {
    const updated = [...darts]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'multiplier' || field === 'segment') {
      const mult = field === 'multiplier' ? value : updated[index].multiplier
      const seg = field === 'segment' ? value : updated[index].segment

      if (seg === 'SBULL') {
        updated[index].points = 25
        updated[index].target = 'SBULL'
      } else if (seg === 'BULL') {
        updated[index].points = 50
        updated[index].target = 'BULL'
      } else {
        const multVal = mult === 'S' ? 1 : mult === 'D' ? 2 : mult === 'T' ? 3 : 1
        updated[index].points = Number(seg) * multVal
        updated[index].target = mult + seg
      }
    }

    setDarts(updated)
  }

  const addOutcome = () => {
    setOutcomes([...outcomes, { label: '', scoredPoints: startScore, resultScore: 0, resultType: 'NEXT_SCORE', nextScore: null, explanation: '' }])
  }

  const removeOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index))
  }

  const updateOutcome = (index: number, field: keyof OutcomeInput, value: any) => {
    const updated = [...outcomes]
    updated[index] = { ...updated[index], [field]: value }
    setOutcomes(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      startScore,
      name,
      priority,
      strategyType,
      skillLevel: skillLevel || null,
      style: style || null,
      description: description || null,
      isPublished,
      darts,
      outcomes: outcomes.filter(o => o.label.trim())
    })
  }

  return (
    <form onSubmit={handleSubmit} className="sub-form" style={{ marginTop: '12px' }}>
      <label>
        Név
        <input value={name} onChange={e => setName(e.target.value)} required />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <label>
          Típus
          <select value={strategyType} onChange={e => setStrategyType(e.target.value as StrategyType)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Stílus
          <select value={style} onChange={e => setStyle(e.target.value as StrategyStyle | '')}>
            <option value="">— nincs —</option>
            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <label>
          Prioritás
          <input type="number" min="1" value={priority} onChange={e => setPriority(Number(e.target.value))} />
        </label>
        <label>
          Skill szint
          <input value={skillLevel} onChange={e => setSkillLevel(e.target.value)} placeholder="pl. general, pro" />
        </label>
        <label>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
            Publikált
          </label>
        </label>
      </div>

      <label>
        Leírás
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </label>

      <div className="sub-form">
        <h4>Dobások ({darts.length}/3)</h4>
        <div className="dart-list">
          {darts.map((dart, i) => (
            <div key={i} className="dart-item">
              <span>#{dart.dartIndex}</span>
              <select
                value={BULL_TARGETS.includes(dart.segment) ? 'BULL' : dart.segment}
                onChange={e => {
                  if (e.target.value === 'BULL') {
                    updateDart(i, 'segment', 'SBULL')
                  } else {
                    updateDart(i, 'segment', e.target.value)
                  }
                }}
              >
                {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="BULL">BULL</option>
              </select>
              {BULL_TARGETS.includes(dart.segment) ? (
                <span style={{ color: 'var(--accent)' }}>
                  {dart.segment === 'SBULL' ? 'SBULL (25)' : 'BULL (50)'}
                </span>
              ) : (
                <>
                  <select value={dart.multiplier} onChange={e => updateDart(i, 'multiplier', e.target.value)}>
                    {MULTIPLIERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>{dart.points} pont</span>
                </>
              )}
              {darts.length > 1 && (
                <button type="button" onClick={() => removeDart(i)} style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>×</button>
              )}
            </div>
          ))}
        </div>
        {darts.length < 3 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={addDart}>+ Szám dobása</button>
            <button type="button" className="btn-secondary" onClick={addBullDart}>+ Bull dobása</button>
          </div>
        )}
      </div>

      <div className="sub-form">
        <h4>Outcomes</h4>
        <div className="outcome-list">
          {outcomes.map((outcome, i) => (
            <div key={i} className="outcome-item">
              <input
                placeholder="Label (pl. T20 S16 D16)"
                value={outcome.label}
                onChange={e => updateOutcome(i, 'label', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                placeholder="Pont"
                value={outcome.scoredPoints}
                onChange={e => updateOutcome(i, 'scoredPoints', Number(e.target.value))}
                style={{ width: '70px' }}
              />
              <span>→</span>
              <input
                type="number"
                placeholder="Marad"
                value={outcome.resultScore}
                onChange={e => updateOutcome(i, 'resultScore', Number(e.target.value))}
                style={{ width: '70px' }}
              />
              <select value={outcome.resultType} onChange={e => updateOutcome(i, 'resultType', e.target.value)}>
                {RESULT_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {outcome.resultType === 'NEXT_SCORE' && (
                <input
                  type="number"
                  placeholder="Következő"
                  value={outcome.nextScore ?? ''}
                  onChange={e => updateOutcome(i, 'nextScore', e.target.value ? Number(e.target.value) : null)}
                  style={{ width: '80px' }}
                />
              )}
              <button type="button" onClick={() => removeOutcome(i)} style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary" onClick={addOutcome}>+ Outcome hozzáadása</button>
      </div>

      <div className="btn-row">
        <button type="submit">Mentés</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Mégse</button>}
      </div>
    </form>
  )
}