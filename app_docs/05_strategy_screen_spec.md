# 05 — Stratégia képernyő specifikáció

## Cél

Az első alkalmazásképernyő feladata a score-hoz tartozó darts stratégiai adatok megjelenítése.

Ez az első körben az egyetlen üzleti képernyő.

## Fő elemek

### 1. Score kiválasztás

Első verzióban elég egy egyszerű input vagy selector.

### 2. Aktuális score megjelenítése

Példa:

```text
108
```

Mellette megjelenhet:

```text
checkout_possible
bogey
normal
terminal
```

### 3. Stratégiai verziók

Egy score-hoz több stratégia tartozhat.

Példa:

```text
108
  1. 19-es kezdés
  2. 20-as kezdés
  3. 18-as kezdés
```

Minden stratégiai blokk tartalmazza:

- stratégia neve,
- prioritás,
- típus,
- stílus,
- rövid leírás,
- tervezett dobássor.

### 4. Tervezett dobássor

Példa:

```text
T19 · S19 · D16
```

### 5. Lehetséges outcome-ok

Példa:

```text
T19 S19 D16 → checkout
S19 T19 D16 → checkout
S19 S19 T10 → 40
T19 S7 S4 → 40
```

Ha van `next_score`, az kattintható lehet.

## Nem része az első verziónak

- dobások rögzítése,
- gyakorló session indítása,
- siker / sikertelenség mentése,
- userhez kötött statisztika,
- saját stratégia szerkesztése,
- admin szerkesztőfelület.

## Elfogadási feltételek

A képernyő akkor tekinthető kész MVP-nek, ha:

- score alapján lekéri az adatokat,
- megjeleníti a score kategóriáját,
- megjeleníti a stratégiákat prioritási sorrendben,
- megjeleníti a tervezett dobássort,
- megjeleníti az outcome-okat,
- outcome alapján át tud navigálni másik score-ra,
- hiányzó score adat esetén értelmes üres állapotot mutat.
