# ADR-0003 — Score-stratégia adatmodell

## Döntés

A score-stratégiákat nem egyetlen nagy JSON mezőben, hanem relációs táblákban tároljuk.

Első fő táblák:

```text
scores
strategies
strategy_darts
strategy_outcomes
```

## Indoklás

A rendszernek kapcsolódó score-útvonalakat kell kezelnie.

Ez:

- jobban validálható relációs modellben,
- jobban lekérdezhető,
- később könnyebben kapcsolható user statisztikákhoz,
- nem zárja ki, hogy egyes extra mezőkben JSONB-t használjunk.
