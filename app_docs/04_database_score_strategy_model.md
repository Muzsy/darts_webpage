# 04 — Score-stratégia adatbázis modell

## 1. Cél

Az alkalmazás célja egy olyan adatbázis létrehozása, amely 501-től lefelé minden releváns darts score-hoz képes stratégiai dobásútvonalakat tárolni.

A modell nem csak klasszikus kiszállókat tárol 170 alatt, hanem általános score-stratégiákat is:

- 501-ről induló háromnyilas pontszerző körök,
- 170 alatti kiszállóstratégiák,
- több stratégiai verzió ugyanahhoz a score-hoz,
- három nyílból álló tervezett dobássorok,
- ezek lehetséges eredményei,
- az eredménytől függő kapcsolódás más score-okhoz,
- checkout, bust, setup és next-score állapotok.

A modell lényege:

```text
Minden score egy állapot.
Minden score-hoz több stratégia tartozhat.
Minden stratégia legfeljebb három dobásból áll.
Minden stratégia több lehetséges eredményre vezethet.
Az eredmény lehet checkout, bust, setup vagy egy másik score.
A másik score-hoz kapcsolódva újra betölthetők az ahhoz tartozó stratégiák.
```

Ez gyakorlatilag egy score-alapú stratégiai gráf, de relációs PostgreSQL adatbázisban jól kezelhető.

---

## 2. Fő táblák

Az első verzióhoz szükséges minimális modell:

```text
scores
strategies
strategy_darts
strategy_outcomes
```

Későbbi userhez kötött funkciókhoz további táblák jöhetnek:

```text
profiles
practice_sessions
practice_attempts
user_preferences
favorite_checkouts
```

Ezek most nem részei az első körnek.

---

## 3. `scores` tábla

A `scores` tábla tartalmazza az összes lehetséges maradék pontot 0 és 501 között.

```sql
create table scores (
  score integer primary key check (score >= 0 and score <= 501),
  category text not null,
  title text,
  note text
);
```

Javasolt `category` értékek:

```text
normal
checkout_possible
bogey
terminal
bust_like
```

Példák:

```text
501 | normal
321 | normal
170 | checkout_possible
169 | bogey
168 | bogey
167 | checkout_possible
108 | checkout_possible
40  | checkout_possible
1   | bust_like
0   | terminal
```

---

## 4. `strategies` tábla

A `strategies` tábla tárolja az adott score-hoz tartozó stratégiai verziókat.

```sql
create table strategies (
  id uuid primary key default gen_random_uuid(),
  start_score integer not null references scores(score),
  name text not null,
  priority integer not null default 1,
  strategy_type text not null,
  skill_level text,
  style text,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Javasolt `strategy_type` értékek:

```text
scoring
setup
checkout
recovery
practice
```

Javasolt `style` értékek:

```text
aggressive
safe
balanced
beginner_friendly
pro
```

---

## 5. `strategy_darts` tábla

A `strategy_darts` tábla a stratégia tervezett dobásait tárolja, dobásonként külön sorban.

```sql
create table strategy_darts (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies(id) on delete cascade,
  dart_index integer not null check (dart_index between 1 and 3),
  target text not null,
  multiplier text not null,
  segment text not null,
  points integer not null,
  is_optional boolean not null default false,
  unique (strategy_id, dart_index)
);
```

Példa 108 / 19-es kezdés esetén:

```text
1 | T19 | T | 19 | 57
2 | S19 | S | 19 | 19
3 | D16 | D | 16 | 32
```

Fontos jelölési szabály:

```text
D16 = 32 pont
```

Ha 32 pont kell a checkout-hoz, az dobásként `D16`, nem `D32`.

---

## 6. `strategy_outcomes` tábla

A `strategy_outcomes` tábla tárolja, hogy egy stratégia milyen lehetséges végeredményekre vezet.

```sql
create table strategy_outcomes (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies(id) on delete cascade,
  label text not null,
  scored_points integer not null,
  result_score integer not null check (result_score >= 0 and result_score <= 501),
  result_type text not null,
  next_score integer references scores(score),
  explanation text
);
```

Javasolt `result_type` értékek:

```text
checkout
next_score
setup
bust
no_score
invalid
```

Példák:

```text
strategy: 108 / 19-es kezdés
label: T19 S19 D16
scored_points: 108
result_score: 0
result_type: checkout
next_score: null
```

```text
strategy: 108 / 19-es kezdés
label: S19 S19 T10
scored_points: 68
result_score: 40
result_type: next_score
next_score: 40
```

---

## 7. Kapcsolatok

```text
scores.score = strategies.start_score
strategies.id = strategy_darts.strategy_id
strategies.id = strategy_outcomes.strategy_id
strategy_outcomes.next_score = scores.score
```

---

## 8. Példa: 108-as score

```text
108
 ├─ T19 S19 D16 → 0
 ├─ S19 T19 D16 → 0
 ├─ S19 S19 T10 → 40
 │                    └─ D20 → 0
 └─ T19 S3 S16 → 32
                      └─ D16 → 0
```

---

## 9. Validációs szabályok

A rendszer ismerje fel:

```text
S1–S20
D1–D20
T1–T20
SBULL / 25
BULL / 50
```

Checkout csak akkor érvényes, ha:

```text
result_score = 0
az utolsó tényleges dobás dupla vagy bull
```

A klasszikus háromnyilas bogey számokat nem szabad checkoutként kezelni:

```text
169
168
166
165
163
162
159
```

Bust lehet például:

```text
a dobott pont nagyobb, mint a start_score
1 marad
0 marad, de nem duplával vagy bullal zárt
```

---

## 10. Összefoglalás

A javasolt modell:

```text
Score = aktuális állapot
Strategy = adott score-hoz tartozó stratégiai verzió
StrategyDart = a stratégia tervezett dobásai
StrategyOutcome = a stratégia lehetséges eredményei és kapcsolódásai
```

Ez alkalmas:

- 501-től induló stratégiai útvonalak tárolására,
- háromnyilas dobássorok kezelésére,
- több stratégiai verzió tárolására ugyanahhoz a score-hoz,
- eredményalapú score-kapcsolatok létrehozására,
- egyetlen stratégia/kiszállótábla képernyő kiszolgálására,
- későbbi gyakorlási és user funkciók előkészítésére.
