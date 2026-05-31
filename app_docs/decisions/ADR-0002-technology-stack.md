# ADR-0002 — Technológiai stack

## Döntés

A javasolt stack:

```text
Next.js
React
TypeScript
Tailwind CSS
PostgreSQL
Prisma
Docker Compose
```

## Indoklás

A projekt adatbázis-alapú webalkalmazás lesz, későbbi auth-tal és user adatokkal.

A stack alkalmas:

- helyi fejlesztésre,
- későbbi Contabo VPS deployra,
- PostgreSQL használatra,
- TypeScript-alapú stabil fejlesztésre,
- későbbi auth integrációra.
