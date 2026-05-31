#!/usr/bin/env bash
set -euo pipefail

mkdir -p app_docs/decisions
mkdir -p app_docs/checklists
mkdir -p prisma/migrations
mkdir -p components/strategy-screen
mkdir -p lib/db
mkdir -p lib/darts
mkdir -p types
mkdir -p scripts/db
mkdir -p scripts/dev

touch prisma/migrations/.gitkeep
touch components/strategy-screen/.gitkeep
touch lib/db/.gitkeep
touch lib/darts/.gitkeep
touch types/.gitkeep
touch scripts/db/.gitkeep
touch scripts/dev/.gitkeep

echo "Project structure created."
