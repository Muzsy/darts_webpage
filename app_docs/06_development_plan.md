# 06 — Fejlesztési terv

## Alapelv

A projektet most nem szabad túltervezni.

A cél:

```text
egy képernyő + adatbázis + dokumentált struktúra
```

## 1. fázis — Projektstruktúra

- repo root rendezése,
- `app_docs/` dokumentációs csomag létrehozása,
- `.gitignore` ellenőrzése,
- `.env.example` létrehozása,
- döntés a Next.js root struktúráról.

## 2. fázis — Technológiai alap

- Next.js + TypeScript létrehozása,
- Tailwind beállítása,
- Docker Compose hozzáadása PostgreSQL-hez,
- Prisma telepítése,
- első Prisma schema létrehozása.

## 3. fázis — Adatbázis modell

- `scores` modell,
- `strategies` modell,
- `strategy_darts` modell,
- `strategy_outcomes` modell,
- migráció létrehozása,
- seed script alapminta adatokkal.

## 4. fázis — Stratégia képernyő

- score selector,
- score detail lekérés,
- stratégiakártyák,
- dobássor megjelenítés,
- outcome lista,
- next score navigáció,
- üres állapot.

## 5. fázis — Validáció

- dobásjelölés parser,
- pontérték számítás,
- checkout validáció,
- bogey ellenőrzés,
- seed adatok ellenőrzése.

## Első fejlesztési célmondat

```text
Építsünk egy Next.js + PostgreSQL + Prisma alapú darts stratégia képernyőt,
amely score alapján megjeleníti a stratégiákat és az outcome-okból más score-okra tud navigálni.
```
