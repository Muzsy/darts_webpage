# 07 — Contabo deploy jegyzetek

## Cél

A projekt később Contabo VPS-en, saját domain mögött fusson.

Az első fejlesztési körben még nem kell deployolni, de a struktúrát úgy kell kialakítani, hogy később ne kelljen alapvetően átszervezni.

## Javasolt későbbi felépítés

```text
Contabo VPS
  Docker Compose
    next-app
    postgres
    caddy vagy nginx
```

## Domain és HTTPS

Javasolt reverse proxy:

```text
Caddy
```

Ok:

- egyszerű konfiguráció,
- automatikus HTTPS,
- kisebb kézi karbantartás.

## Most nem szükséges

Most még nem kell:

- production Dockerfile véglegesítése,
- CI/CD,
- domain beállítás,
- HTTPS konfiguráció,
- backup automatizálás.

A lényeg, hogy a projektstruktúra kompatibilis maradjon ezekkel.
