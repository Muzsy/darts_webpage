#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "=== Darts Weboldal Indító Script ==="

if [ ! -f .env ]; then
    echo "[1/6] .env fájl létrehozása..."
    cp .env.example .env
else
    echo "[1/6] .env már létezik, átugorva."
fi

if ! docker info > /dev/null 2>&1; then
    echo "[Hiba] Docker nem fut vagy nem elérhető."
    exit 1
fi

echo "[2/6] PostgreSQL konténer indítása..."
docker-compose up -d postgres
echo "      Várakozás az adatbázisra (max 30s)..."
timeout=30
while ! docker-compose exec -T postgres pg_isready -U darts_user -d darts_webpage > /dev/null 2>&1; do
    timeout=$((timeout - 2))
    if [ $timeout -le 0 ]; then
        echo "[Hiba] Adatbázis nem lett kész időben."
        exit 1
    fi
    sleep 2
done
echo "      PostgreSQL kész."

echo "[3/6] npm install..."
npm install > /dev/null 2>&1

echo "[4/6] Prisma migráció..."
npx prisma migrate deploy > /dev/null 2>&1 || npx prisma migrate dev --name init --skip-generate > /dev/null 2>&1 || echo "      Migráció már létezik vagy hiba."

echo "[5/6] Seed adatok betöltése..."
npm run db:seed > /dev/null 2>&1 || echo "      Seed már megtörtént."

echo "[6/6] Dev szerver indítása..."
echo ""
echo "=== KÉSZ ==="
echo "Nyisd meg: http://localhost:3000"
echo "Minta:      http://localhost:3000/?score=108"
echo ""
npm run dev