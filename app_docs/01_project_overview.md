# 01 — Projekt alapadatok

## Projekt neve

`darts_webpage`

## Git repository

```text
https://github.com/Muzsy/darts_webpage.git
```

## Projekt típusa

Webalkalmazás.

Nem egyszerű statikus weboldal, mert adatbázisra, későbbi authentikációra és userhez kötött adatokra is fel kell készíteni.

## Első verzió célja

Az első verzió célja egyetlen képernyő megépítése:

```text
Stratégia / kiszállótábla képernyő
```

Ez a képernyő score-alapú darts dobásstratégiákat jelenít meg.

## Alaplogika

A rendszer minden score-t állapotként kezel.

Példa:

```text
108
 ├─ 19-es kezdés
 │   ├─ T19 S19 D16 → 0
 │   ├─ S19 T19 D16 → 0
 │   └─ S19 S19 T10 → 40
 └─ 20-as kezdés
     ├─ T20 S16 D16 → 0
     └─ S20 S20 S20 → 48
```

A score-ok és stratégiák gráfszerűen kapcsolódnak egymáshoz, de az adatbázis PostgreSQL-ben, relációs táblákban tárolható.

## Első célállapot

Az első kész állapot akkor fogadható el, ha:

- létezik rendezett projektstruktúra,
- létezik dokumentált adatmodell,
- PostgreSQL-re tervezett séma elkészült,
- a stratégia képernyő backend/adatmodell szinten kiszolgálható,
- legalább néhány validált score mintaadatként betölthető,
- a projekt később Contabo VPS-re portolható marad.
