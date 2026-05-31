# darts_webpage

Darts score-stratégia és kiszállótábla webalkalmazás.

## Aktuális scope

Az első verzió szándékosan csak erre fókuszál:

- egyetlen stratégia/kiszállótábla képernyő,
- PostgreSQL adatbázis,
- Prisma adatmodell,
- score-ok 0–501 között,
- score-hoz tartozó stratégiai verziók,
- maximum háromnyilas tervezett dobássorok,
- outcome-ok és más score-okhoz kapcsolódó navigáció.

Most még nincs:

- gyakorló képernyő,
- auth,
- user profil,
- statisztika,
- admin szerkesztő.

## Technológia

- Next.js
- React
- TypeScript
- PostgreSQL
- Prisma
- Docker Compose

## Első indítás

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate -- --name init_score_strategy_model
npm run db:seed
npm run dev
```

Böngészőben:

```text
http://localhost:3000
```

Minta score:

```text
http://localhost:3000/?score=108
```

## Hasznos parancsok

```bash
npm run db:studio
npm run db:generate
npm run build
```
