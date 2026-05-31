# Darts Checkout / Score Strategy adatbázis-szerkezet

## 1. Cél

Az alkalmazás célja egy olyan adatbázis létrehozása, amely 501-től lefelé minden releváns darts score-hoz képes stratégiai dobásútvonalakat tárolni.

A modell nem csak klasszikus kiszállókat tárol 170 alatt, hanem általános **score-stratégiákat** is:

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

## 2. Alapfogalmak

### Score

Az aktuális maradék pontszám.

Példák:

```text
501
321
170
108
60
40
0
```

A `0` terminális állapot, vagyis sikeres checkout.

### Strategy

Egy adott score-hoz tartozó ajánlott stratégiai útvonal.

Példa 108-ra:

```text
19-es kezdés
20-as kezdés
18-as kezdés
biztonsági setup
haladó/profi útvonal
```

### StrategyDart

Egy stratégia tervezett dobásai, maximum három nyílra bontva.

Példa:

```text
T19
S19
D16
```

### StrategyOutcome

Egy stratégia vagy stratégiai ág lehetséges végeredménye.

Példa:

```text
T19 S19 D16 → 0    checkout
S19 S19 T10 → 40   next_score
S20 S20 S20 → 48   next_score
hibás dupla → bust
```

---

## 3. Javasolt fő táblák

A minimális, de később jól bővíthető modell:

```text
scores
strategies
strategy_darts
strategy_outcomes
```

Későbbi userhez kötött funkciókhoz további táblák jöhetnek:

```text
users / auth provider táblák
profiles
practice_sessions
practice_attempts
user_preferences
favorite_checkouts
```

Ez a dokumentum elsődlegesen a score-stratégia adatmodellre fókuszál.

---

## 4. `scores` tábla

A `scores` tábla tartalmazza az összes lehetséges maradék pontot.

### Feladat

- minden score azonosítása 0 és 501 között,
- score kategorizálása,
- opcionális magyarázat, jelölés vagy megjegyzés tárolása.

### Javasolt mezők

```sql
create table scores (
  score integer primary key check (score >= 0 and score <= 501),
  category text not null,
  title text,
  note text
);
```

### Javasolt `category` értékek

```text
normal
checkout_possible
bogey
terminal
bust_like
```

### Példák

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

### Megjegyzés

A klasszikus értelemben vett checkout csak 170 alatt releváns, és ott sem minden score kiszállható három nyílból. A 169, 168, 166, 165, 163, 162 és 159 például klasszikus bogey számok, tehát három nyílból nem kiszállhatók.

---

## 5. `strategies` tábla

A `strategies` tábla tárolja az adott score-hoz tartozó stratégiai verziókat.

### Feladat

- egy score-hoz több stratégia rögzítése,
- prioritási sorrend tárolása,
- stratégia típusának és stílusának jelölése,
- publikálási állapot kezelése.

### Javasolt mezők

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

### Javasolt `strategy_type` értékek

```text
scoring
setup
checkout
recovery
practice
```

### Javasolt `style` értékek

```text
aggressive
safe
balanced
beginner_friendly
pro
```

### Példák

```text
start_score: 501
name: "Max pont stratégia"
priority: 1
strategy_type: scoring
style: aggressive
```

```text
start_score: 108
name: "19-es kezdés"
priority: 1
strategy_type: checkout
style: safe
```

```text
start_score: 108
name: "20-as kezdés"
priority: 2
strategy_type: checkout
style: balanced
```

---

## 6. `strategy_darts` tábla

A `strategy_darts` tábla a stratégia tervezett dobásait tárolja, dobásonként külön sorban.

### Feladat

- maximum három tervezett dobás tárolása,
- dobások sorrendjének kezelése,
- célmező, szorzó és pontérték tárolása,
- későbbi validáció és statisztika támogatása.

### Javasolt mezők

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

### Mezők jelentése

```text
dart_index   1, 2 vagy 3
target       például T20, S19, D16, BULL, SBULL
multiplier   S, D, T, BULL, SBULL
segment      1–20, 25, 50 vagy bull jelölés
points       a dobás pontértéke
```

### Példa

108 / 19-es kezdés:

```text
1 | T19 | T | 19 | 57
2 | S19 | S | 19 | 19
3 | D16 | D | 16 | 32
```

### Fontos jelölési szabály

A darts jelölésben a dupla mezőt mindig a tényleges dobással kell megadni, nem a maradék pontszámmal.

Helyes:

```text
D16 = 32 pont
```

Hibás vagy félrevezető:

```text
D32
```

Ha 32 pont kell a checkout-hoz, az dobásként `D16`, nem `D32`.

---

## 7. `strategy_outcomes` tábla

A `strategy_outcomes` tábla tárolja, hogy egy stratégia milyen lehetséges végeredményekre vezet.

Ez a modell legfontosabb része, mert ettől lesz a rendszer interaktív stratégiai gráf.

### Feladat

- adott stratégia lehetséges kimeneteinek tárolása,
- dobott pontszám alapján új score meghatározása,
- checkout / bust / next_score / setup típus kezelése,
- kapcsolódás másik score-hoz.

### Javasolt mezők

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

### Javasolt `result_type` értékek

```text
checkout
next_score
setup
bust
no_score
invalid
```

### Mezők jelentése

```text
label          az ág olvasható jelölése, például "S19 S19 T10"
scored_points  az adott ágban ténylegesen dobott pont
result_score   az új maradék pont
result_type    az eredmény típusa
next_score     ha az ág másik score-hoz vezet, akkor annak az értéke
explanation    magyarázat, oktatási szöveg
```

### Példák

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

```text
strategy: 108 / 20-as kezdés
label: S20 S20 S20
scored_points: 60
result_score: 48
result_type: next_score
next_score: 48
```

---

## 8. Kapcsolatok

### Score → Strategies

Egy score-hoz több stratégia tartozhat.

```text
scores.score = strategies.start_score
```

Példa:

```text
108
 ├─ 19-es kezdés
 ├─ 20-as kezdés
 └─ 18-as kezdés
```

### Strategy → StrategyDarts

Egy stratégia maximum három tervezett dobásból áll.

```text
strategies.id = strategy_darts.strategy_id
```

Példa:

```text
19-es kezdés
 ├─ T19
 ├─ S19
 └─ D16
```

### Strategy → StrategyOutcomes

Egy stratégia több lehetséges eredményre vezethet.

```text
strategies.id = strategy_outcomes.strategy_id
```

Példa:

```text
19-es kezdés
 ├─ T19 S19 D16 → checkout
 ├─ S19 T19 D16 → checkout
 ├─ S19 S19 T10 → 40
 └─ T19 S7 S4 → 40
```

### Outcome → Score

Egy outcome másik score-hoz kapcsolódhat.

```text
strategy_outcomes.next_score = scores.score
```

Példa:

```text
108 / S19 S19 T10 → 40
40 / D20 → checkout
```

---

## 9. Példa: 108-as score

### Score

```text
108 | checkout_possible
40  | checkout_possible
52  | checkout_possible
32  | checkout_possible
0   | terminal
```

### Stratégiák

```text
108 | 19-es kezdés | priority 1 | checkout | safe
108 | 20-as kezdés | priority 2 | checkout | balanced
108 | 18-as kezdés | priority 3 | checkout | alternative
```

### Tervezett dobások: 19-es kezdés

```text
1 | T19 | 57
2 | S19 | 19
3 | D16 | 32
```

Összesen:

```text
57 + 19 + 32 = 108
```

### Lehetséges outcome-ok

```text
T19 S19 D16 → 0  | checkout
S19 T19 D16 → 0  | checkout
S19 S19 T10 → 40 | next_score
T19 S7 S4 → 40   | next_score
T19 S3 S16 → 32  | next_score
```

### Gráfszerű értelmezés

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

## 10. Validációs szabályok

A stratégiai adatokat mentés előtt validálni kell.

### Dobásjelölés-validáció

A rendszer ismerje fel és ellenőrizze:

```text
S1–S20
D1–D20
T1–T20
SBULL / Outer Bull / 25
BULL / Inner Bull / 50
```

### Pontérték-validáció

Példák:

```text
S20 = 20
D20 = 40
T20 = 60
S19 = 19
D16 = 32
T19 = 57
BULL = 50
SBULL = 25
```

### Stratégiaösszeg-validáció

Ellenőrizni kell, hogy a stratégia dobásai és outcome-jai matematikailag helyesek-e.

Példa:

```text
start_score = 108
label = S19 S19 T10
dobott pont = 19 + 19 + 30 = 68
result_score = 108 - 68 = 40
```

### Checkout-validáció

Checkout csak akkor érvényes, ha:

```text
result_score = 0
az utolsó tényleges dobás dupla vagy bull
```

Példa helyes checkout:

```text
T19 S19 D16 → 0
```

Példa hibás checkout:

```text
T20 T16 S0 → 0
```

A checkout nem záródhat szimplával vagy triplával.

### Bogey számok

A klasszikus háromnyilas bogey számokat nem szabad checkoutként kezelni.

Példák:

```text
169
168
166
165
163
162
159
```

### Bust szabályok

Bust lehet például:

```text
a dobott pont nagyobb, mint a start_score
1 marad
0 marad, de nem duplával/bullal zárt
```

---

## 11. Miért nem elég egyetlen JSON mező?

Egy nagyon egyszerű verzió működhetne így:

```text
checkout_strategies
- score
- data jsonb
```

Ez gyors induláshoz kényelmes, de később korlátozó.

Hátrányok:

- nehezebb keresni,
- nehezebb validálni,
- nehezebb statisztikázni,
- nehezebb userhez kötött gyakorlási adatokat kapcsolni,
- nehezebb ellenőrizni, hogy minden next_score létezik-e,
- nehezebb admin felületet építeni.

Ezért a fő entitásokat relációs táblákban érdemes tárolni:

```text
scores
strategies
strategy_darts
strategy_outcomes
```

Magyarázatokhoz, extra metaadatokhoz, oktatási megjegyzésekhez később használható `jsonb`, de a fő kapcsolatok ne csak JSON-ban legyenek.

---

## 12. Későbbi bővítési irányok

### Felhasználói gyakorlás

Későbbi táblák:

```text
practice_sessions
practice_attempts
```

Lehetséges adatok:

```text
user_id
score
választott stratégia
sikeres / sikertelen
dobott mezők
maradék score
hibaminta
időpont
```

### Felhasználói preferenciák

Példák:

```text
kedvenc dupla: D16
került dupla: D19
preferált kezdőszektor: 20
kezdő / haladó / profi profil
```

### Statisztikák

Lekérdezhető kérdések:

```text
Melyik score megy rosszul?
Melyik dupla gyenge?
Melyik útvonalat választja gyakran?
Melyik score-t gyakorolta legtöbbször?
Hány sikeres checkout volt 80–100 között?
Melyik stratégia működik neki a legjobban?
```

### Ajánlórendszer

Később a rendszer szabályalapon vagy AI-szerűen ajánlhat stratégiát:

```text
ha a user D16-on erős → D16-ra hagyó útvonalak előrébb
ha D20 gyenge → kerülje a D20-as lezárást
ha kezdő → biztonságosabb setup utak
ha haladó → agresszívebb checkout utak
```

---

## 13. Első megvalósítási javaslat

Első körben az alábbi táblák elegendők:

```text
scores
strategies
strategy_darts
strategy_outcomes
```

Első adatfeltöltési cél:

```text
501–171: scoring és setup stratégiák
170–2: checkout / bogey / setup stratégiák
0: terminal state
1: bust_like state
```

Kezdésnek nem szükséges azonnal az összes score teljes adatbázisa. Érdemes validált mintákkal indulni:

```text
501
321
170
167
164
108
100
80
60
52
40
32
24
16
8
4
2
0
```

Ezután lehet fokozatosan feltölteni a teljes score-tartományt.

---

## 14. Összefoglalás

A javasolt modell lényege:

```text
Score = aktuális állapot
Strategy = adott score-hoz tartozó stratégiai verzió
StrategyDart = a stratégia tervezett dobásai
StrategyOutcome = a stratégia lehetséges eredményei és kapcsolódásai
```

Ez a szerkezet alkalmas:

- 501-től induló stratégiai útvonalak tárolására,
- háromnyilas dobássorok kezelésére,
- több stratégiai verzió tárolására ugyanahhoz a score-hoz,
- eredményalapú score-kapcsolatok létrehozására,
- interaktív gyakorló weboldal építésére,
- későbbi userhez kötött gyakorlási statisztikákra,
- személyre szabott ajánlásokra.

A modell PostgreSQL-ben jól kezelhető, Prisma ORM-mel egyszerűen használható, és később Contabo szerverre is jól portolható.
