# 08 — Next.js + Prisma starter jegyzet

Ez a csomag a projekt első működő technológiai alapját adja.

## Tartalmazza

- Next.js app router alapot,
- TypeScript konfigurációt,
- PostgreSQL Docker Compose konfigurációt,
- Prisma schema-t,
- seed scriptet,
- egyetlen stratégia képernyőt,
- 108 / 40 / 32 minta stratégiákat.

## Nem tartalmazza

- auth,
- userhez kötött adatokat,
- gyakorló képernyőt,
- admin felületet,
- production deploy konfigurációt.

## Első ellenőrzés

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate -- --name init_score_strategy_model
npm run db:seed
npm run dev
```

Majd:

```text
http://localhost:3000/?score=108
```
