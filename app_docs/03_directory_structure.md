# 03 — Projektkönyvtár javasolt struktúrája

## Kiinduló helyzet

A helyi projektkönyvtár:

```text
darts_webpage/
  app/
  app_docs/
  basic_docs/
  basic_docs.zip
```

## Javasolt célstruktúra

```text
darts_webpage/
  README.md

  app/
    # Next.js App Router oldalak és route-ok

  app_docs/
    README.md
    00_current_scope.md
    01_project_overview.md
    02_technology_stack.md
    03_directory_structure.md
    04_database_score_strategy_model.md
    05_strategy_screen_spec.md
    06_development_plan.md
    07_contabo_deploy_notes.md

    decisions/
      ADR-0001-current-scope.md
      ADR-0002-technology-stack.md
      ADR-0003-score-strategy-database-model.md

    checklists/
      initial_setup_checklist.md

  components/
    strategy-screen/

  lib/
    db/
    darts/

  prisma/
    schema.prisma
    migrations/
    seed.ts

  scripts/
    db/
    dev/

  basic_docs/
    # eredeti / nyers dokumentációk

  .env.example
  .gitignore
  docker-compose.yml
  package.json
```

## Javaslat

A `darts_webpage` repo gyökere legyen maga az alkalmazás rootja.

Tehát a `package.json`, `docker-compose.yml`, `prisma/`, `app_docs/` mind a repo gyökerében legyen.

A Next.js saját `app/` könyvtára maradhat a repo gyökerében.

## Miért?

Így a repo egyszerűbb:

- nincs fölösleges nested app,
- könnyebb deployolni,
- egyszerűbb Dockerfile-t írni,
- egyszerűbb Prisma migrációkat kezelni,
- könnyebb CI/CD-t hozzáadni később.
