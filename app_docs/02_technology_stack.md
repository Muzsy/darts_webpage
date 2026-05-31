# 02 — Technológiai döntések

## Ajánlott fejlesztőkörnyezet

```text
VS Code
Git
Node.js
Docker / Docker Compose
PostgreSQL
```

A VS Code megfelelő ehhez a projekthez. Nem szükséges külön weboldal-szerkesztő alkalmazás.

## Javasolt alkalmazás-stack

```text
Next.js
React
TypeScript
Tailwind CSS
PostgreSQL
Prisma ORM
Docker Compose
```

## Miért Next.js?

A projekt már az első verzióban adatbázisra épül, később pedig authentikáció és userhez kötött adatok várhatók.

Ezért jobb választás egy teljes webapp keretrendszer, mint egy sima HTML/CSS/JS oldal.

## Miért PostgreSQL?

A projekt célja:

- helyi fejlesztés,
- későbbi Contabo VPS deploy,
- domain mögötti futtatás,
- későbbi auth és user adatok,
- bővíthető relációs adatmodell.

Ezért PostgreSQL legyen az alap, ne SQLite.

## Miért Prisma?

A Prisma segít:

- adatmodell deklarálásában,
- migrációk kezelésében,
- TypeScript típusok generálásában,
- adatbázis-lekérdezések biztonságosabb kezelésében.

## Auth később

Az első körben az auth nem része a scope-nak, de a stack legyen kompatibilis későbbi auth-tal.

Lehetséges későbbi irány:

```text
Auth.js + Prisma Adapter + PostgreSQL
```

## Deploy később

Későbbi cél:

```text
Contabo VPS
Docker Compose
PostgreSQL container vagy külön Postgres szolgáltatás
Next.js app container
Caddy vagy Nginx reverse proxy
HTTPS
domain
backup
```

## Aktuális döntés

Most nem építünk teljes production deploymentet.

Most a cél:

- projektstruktúra,
- dokumentáció,
- adatbázis-séma,
- egy képernyő kiszolgálásához szükséges alap.
