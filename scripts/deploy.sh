#!/bin/bash
# =============================================================================
# darts_webpage deploy script (Contabo production)
# =============================================================================
# Ez a script a contabo szerveren fut, push után (manuálisan vagy webhook
# által). Feladatai:
#   1. git pull a main branch-ről
#   2. postgres + next-app image-ek buildelése
#   3. prisma migrate deploy futtatása (a konténerben, a migrációk a repóban)
#   4. seed futtatása (opció 1: repo SOT - minden deploykor újrafut)
#   5. konténerek újraindítása
#   6. Caddy reload (ha a Caddyfile is változott)
#
# Használat (a contabo-n, /opt/darts_webpage könyvtárban):
#   ./scripts/deploy.sh                 # normál deploy
#   ./scripts/deploy.sh --skip-seed     # migráció igen, seed nem
#   ./scripts/deploy.sh --skip-migrate  # seed igen, migráció nem
#   ./scripts/deploy.sh --no-reload     # Caddy reload kihagyása
#
# Környezeti változók (opcionális, alapértelmezettek használhatók):
#   DEPLOY_BRANCH=main                   # melyik branch-ről pull-oljon
#   DEPLOY_DIR=/opt/darts_webpage        # hová lett klónozva a repo
#   CADDY_CONTAINER=ghost_caddy_1        # a Caddy konténer neve (ghost-é)
#   CADDY_FILE_HOST=/root/ghost/Caddyfile   # a Caddyfile a hoston
#   COMPOSE_CMD="docker compose"         # v2 alap; v1 esetén: docker-compose
# =============================================================================

set -euo pipefail

# --- Konfiguráció (env-ből, vagy alapértelmezett) ---
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/darts_webpage}"
CADDY_CONTAINER="${CADDY_CONTAINER:-ghost_caddy_1}"
CADDY_FILE_HOST="${CADDY_FILE_HOST:-/root/ghost/Caddyfile}"
COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"

# --- Argumentumok ---
SKIP_SEED=0
SKIP_MIGRATE=0
NO_RELOAD=0
for arg in "$@"; do
  case "$arg" in
    --skip-seed) SKIP_SEED=1 ;;
    --skip-migrate) SKIP_MIGRATE=1 ;;
    --no-reload) NO_RELOAD=1 ;;
    -h|--help)
      cat <<'HELP'
darts_webpage deploy script (Contabo production)

Feladatai:
  1. git pull a main branch-ről
  2. postgres + next-app image-ek buildelése
  3. prisma migrate deploy futtatása (a konténerben, a migrációk a repóban)
  4. seed futtatása (opció 1: repo SOT - minden deploykor újrafut)
  5. konténerek újraindítása
  6. Caddy reload (ha a Caddyfile is változott)

Használat (a contabo-n, /opt/darts_webpage könyvtárban):
  ./scripts/deploy.sh                 # normál deploy
  ./scripts/deploy.sh --skip-seed     # migráció igen, seed nem
  ./scripts/deploy.sh --skip-migrate  # seed igen, migráció nem
  ./scripts/deploy.sh --no-reload     # Caddy reload kihagyása

Környezeti változók (opcionális, alapértelmezettek használhatók):
  DEPLOY_BRANCH=main                   # melyik branch-ről pull-oljon
  DEPLOY_DIR=/opt/darts_webpage        # hová lett klónozva a repo
  CADDY_CONTAINER=ghost_caddy_1        # a Caddy konténer neve (ghost-é)
  CADDY_FILE_HOST=/root/ghost/Caddyfile   # a Caddyfile a hoston
  COMPOSE_CMD="docker compose"         # v2 alap; v1 esetén: docker-compose
HELP
      exit 0
      ;;
    *)
      echo "[deploy] Ismeretlen argumentum: $arg" >&2
      exit 2
      ;;
  esac
done

# --- Lockolás: ne fusson két deploy egyszerre ---
LOCK_FILE="/tmp/darts-webpage-deploy.lock"
if [ -e "$LOCK_FILE" ]; then
  # Ha a lock file 30 percnél öregebb, feltételezzük hogy zombi, felülírjuk
  if find "$LOCK_FILE" -mmin +30 2>/dev/null | grep -q .; then
    echo "[deploy] Régi lock file (>30 perc) felülírása: $LOCK_FILE"
    rm -f "$LOCK_FILE"
  else
    echo "[deploy] HIBA: másik deploy fut (lock: $LOCK_FILE). Ha biztosan leállt, töröld a fájlt." >&2
    exit 1
  fi
fi
trap 'rm -f "$LOCK_FILE"' EXIT
echo "$$" > "$LOCK_FILE"

# --- Időbélyeg + log ---
TS() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { echo "[$(TS)] [deploy] $*"; }

log "Indulás. Branch=$DEPLOY_BRANCH, dir=$DEPLOY_DIR, compose=$COMPOSE_CMD"
log "Opciók: SKIP_SEED=$SKIP_SEED, SKIP_MIGRATE=$SKIP_MIGRATE, NO_RELOAD=$NO_RELOAD"

# --- Előfeltételek ---
if ! command -v docker >/dev/null 2>&1; then
  log "HIBA: a 'docker' parancs nem elérhető."
  exit 1
fi
if ! command -v $COMPOSE_CMD >/dev/null 2>&1; then
  log "HIBA: a '$COMPOSE_CMD' parancs nem elérhető. Telepítsd a docker compose v2 plugint, vagy állítsd a COMPOSE_CMD változót."
  exit 1
fi
if [ ! -d "$DEPLOY_DIR/.git" ]; then
  log "HIBA: a $DEPLOY_DIR nem git repo (hiányzik a .git/). Klónozd a darts_webpage repót ide."
  exit 1
fi
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  log "HIBA: a $DEPLOY_DIR/.env fájl nem létezik. Másold át a .env.example-t, és töltsd ki a DATABASE_URL-t."
  exit 1
fi

# --- Belépés a deploy könyvtárba ---
cd "$DEPLOY_DIR"

# --- Git pull ---
log "Git fetch + reset a $DEPLOY_BRANCH branch-re..."
git fetch origin "$DEPLOY_BRANCH"
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse "origin/$DEPLOY_BRANCH")
if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
  log "Nincs új commit a $DEPLOY_BRANCH branch-en (SHA: ${LOCAL_SHA:0:7})."
else
  log "Új commitok: ${LOCAL_SHA:0:7} -> ${REMOTE_SHA:0:7}"
  # A git pull rebase nélkül merge-t csinálhat, ami lokál módosításoknál konfliktust okoz
  # A deploy környezetben tiszta working tree-t feltételezünk, de a biztonság kedvéért:
  git reset --hard "origin/$DEPLOY_BRANCH"
fi

# --- Image-ek buildelése ---
log "Image-ek buildelése (next-app: ez lassabb)..."
$COMPOSE_CMD build --pull

# --- Postgres indítása (és várakozás a healthcheck-re) ---
log "Postgres konténer indítása..."
$COMPOSE_CMD up -d postgres
log "Várakozás a postgres healthcheck-re (max 60s)..."
TIMEOUT=60
while ! $COMPOSE_CMD exec -T postgres pg_isready -U darts_user -d darts_webpage >/dev/null 2>&1; do
  TIMEOUT=$((TIMEOUT - 2))
  if [ "$TIMEOUT" -le 0 ]; then
    log "HIBA: a postgres nem lett kész 60s alatt."
    exit 1
  fi
  sleep 2
done
log "Postgres kész."

# --- Migráció ---
if [ "$SKIP_MIGRATE" = "0" ]; then
  log "Prisma migrate deploy futtatása..."
  $COMPOSE_CMD run --rm next-app npx prisma migrate deploy
else
  log "Migráció kihagyva (--skip-migrate)."
fi

# --- Seed (1-es verzió: repo SOT, mindig újrafut) ---
if [ "$SKIP_SEED" = "0" ]; then
  log "Seed futtatása (opció 1: repo SOT)..."
  $COMPOSE_CMD run --rm next-app npm run db:seed
else
  log "Seed kihagyva (--skip-seed)."
fi

# --- App indítása ---
log "next-app konténer indítása..."
$COMPOSE_CMD up -d next-app
log "Várakozás a next-app healthcheck-re (max 30s)..."
TIMEOUT=30
APP_OK=0
while [ "$TIMEOUT" -gt 0 ]; do
  if $COMPOSE_CMD exec -T next-app wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1; then
    APP_OK=1
    break
  fi
  TIMEOUT=$((TIMEOUT - 2))
  sleep 2
done
if [ "$APP_OK" = "0" ]; then
  log "FIGYELEM: a next-app 30s alatt nem válaszolt a belső 3000-es porton. Lehet, hogy lassabban indul, vagy a seed/migrate hibázott. Ellenőrizd a logot:"
  log "  $COMPOSE_CMD logs --tail=50 next-app"
else
  log "next-app válaszol. Státusz:"
  $COMPOSE_CMD ps next-app
fi

# --- Caddy reload (ha a Caddyfile-ot nem mi kezeljük, kihagyható) ---
if [ "$NO_RELOAD" = "0" ]; then
  if docker ps --format '{{.Names}}' | grep -q "^${CADDY_CONTAINER}$"; then
    if [ -f "$CADDY_FILE_HOST" ]; then
      log "Caddyfile frissítésének ellenőrzése ($CADDY_FILE_HOST)..."
      # A Caddy konténer bind-mounton keresztül ugyanazt a fájlt látja, mint a host.
      # Tehát a hoston a fájl már naprakész. Csak a Caddy-t kell újratölteni.
      if docker exec "$CADDY_CONTAINER" caddy validate --config /etc/caddy/Caddyfile 2>&1 | grep -q 'Valid configuration'; then
        log "Caddyfile valid. Caddy reload..."
        docker exec "$CADDY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile
        log "Caddy újratöltve."
      else
        log "FIGYELEM: a Caddyfile érvénytelen, a Caddy reload kimaradt. Futtasd kézzel: docker exec $CADDY_CONTAINER caddy validate --config /etc/caddy/Caddyfile"
      fi
    else
      log "A Caddyfile host-oldali másolata nem található ($CADDY_FILE_HOST). Caddy reload kihagyva."
    fi
  else
    log "A '$CADDY_CONTAINER' konténer nem fut. Caddy reload kihagyva (valószínűleg külön stack kezeli)."
  fi
else
  log "Caddy reload kihagyva (--no-reload)."
fi

log "Deploy kész. SHA: ${REMOTE_SHA:0:7}"
