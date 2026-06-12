#!/usr/bin/env python3
"""
darts_webpage GitHub webhook receiver
=====================================

Ez a service a GitHub webhookjait fogadja a contabo szerveren, és minden
push eseményre (ami a main branch-re jön) futtatja a deploy.sh-t.

Végpontok:
  POST /webhook/deploy   - A GitHub webhook hívását fogadja
  GET  /webhook/health   - Egyszerű health check (a Caddy reverse proxy teszteléséhez)

Hitelesítés:
  - A GitHub a X-Hub-Signature-256 headerben küldi a HMAC-SHA256 aláírást
    (a secret-ből és a request body-ból számítva)
  - A service a WEBHOOK_SECRET env változóból olvassa a titkot
  - Ha a header hiányzik vagy nem stimmel, 401-et ad

Futtatás:
  - A contabo-n systemd service-ként fut (darts-webhook.service)
  - A port: 9000 (Caddy reverse-proxy alatt: darts.smartflowdigest.com/webhook/*)
  - A logok: /var/log/darts-webhook.log

GitHub repo beállítás:
  - Settings → Webhooks → Add webhook
  - Payload URL: https://darts.smartflowdigest.com/webhook/deploy
  - Content type: application/json
  - Secret: ugyanaz, mint a WEBHOOK_SECRET env változó
  - SSL verification: enabled
  - Events: "Just the push event"
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import subprocess
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

# --- Konfiguráció ---
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")
DEPLOY_SCRIPT = os.environ.get("DEPLOY_SCRIPT", "/opt/darts_webpage/scripts/deploy.sh")
LOG_FILE = os.environ.get("LOG_FILE", "/var/log/darts-webhook.log")
PORT = int(os.environ.get("PORT", "9000"))
EXPECTED_REF = "refs/heads/main"  # Csak a main branch pushjaira deploy-olunk

# --- Logging: stdout + fájl ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("darts-webhook")


def verify_signature(body: bytes, signature_header: str) -> bool:
    """
    A GitHub a X-Hub-Signature-256 headerben küldi: 'sha256=<hex_digest>'
    A digest = HMAC-SHA256(secret, body) hex formában.
    """
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    if not WEBHOOK_SECRET:
        log.error("WEBHOOK_SECRET env változó nincs beállítva — minden kérés elutasítva.")
        return False
    expected = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()
    # Időzítés-biztos összehasonlítás (ne legyen side-channel)
    return hmac.compare_digest(expected, signature_header)


def run_deploy_async(commit_sha: str, pusher: str) -> None:
    """
    A deploy.sh-t háttérszálon futtatja, hogy a HTTP válasz gyors legyen.
    A deploy akár 1-2 percig is tarthat (image build), és a GitHub-nak
    10s-en belül kell válaszolnunk.
    """
    log.info(f"Deploy indul (SHA: {commit_sha[:7]}, pusher: {pusher})...")
    try:
        result = subprocess.run(
            [DEPLOY_SCRIPT],
            capture_output=True,
            text=True,
            timeout=600,  # 10 perc max
            env={**os.environ, "DEPLOY_TRIGGER": f"github-webhook:{pusher}:{commit_sha[:7]}"},
        )
        if result.returncode == 0:
            log.info(f"Deploy sikeres (SHA: {commit_sha[:7]})")
        else:
            log.error(
                f"Deploy SIKERTELEN (SHA: {commit_sha[:7]}, exit: {result.returncode})\n"
                f"--- stdout ---\n{result.stdout[-2000:]}\n"
                f"--- stderr ---\n{result.stderr[-2000:]}"
            )
    except subprocess.TimeoutExpired:
        log.error(f"Deploy TIMEOUT (SHA: {commit_sha[:7]})")
    except Exception as e:
        log.exception(f"Deploy váratlan hiba: {e}")


class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):  # noqa: A002
        # Az alapértelmezett BaseHTTPRequestHandler a stderr-re ír, ami a systemd journalba megy.
        # Helyette a saját loggerünket használjuk.
        log.debug(f"{self.address_string()} - {format % args}")

    def do_GET(self):  # noqa: N802
        if self.path == "/webhook/health" or self.path == "/webhook/health/":
            body = b'{"status":"ok","service":"darts-webhook"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):  # noqa: N802
        if self.path != "/webhook/deploy" and self.path != "/webhook/deploy/":
            self.send_response(404)
            self.end_headers()
            return

        # Body beolvasása (max 1 MB, a GitHub payload néhány KB)
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length == 0 or content_length > 1_000_000:
            self.send_response(400)
            self.end_headers()
            return
        body = self.rfile.read(content_length)

        # HMAC signature ellenőrzés
        signature = self.headers.get("X-Hub-Signature-256", "")
        if not verify_signature(body, signature):
            log.warning(f"Érvénytelen signature, kérés elutasítva. Remote: {self.address_string()}")
            self.send_response(401)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Invalid signature\n")
            return

        # JSON payload feldolgozása
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            log.warning("Érvénytelen JSON payload")
            self.send_response(400)
            self.end_headers()
            return

        # Csak a main branch pushjaira deploy-olunk
        ref = payload.get("ref", "")
        if ref != EXPECTED_REF:
            log.info(f"Ignorálva (ref={ref}, várt: {EXPECTED_REF})")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ignored", "reason": "not main branch"}).encode())
            return

        # Push event? (ping is jöhet webhook setupkor, az is deploy-t indít, az OK)
        head_commit = payload.get("head_commit") or {}
        commit_sha = head_commit.get("id") or payload.get("after", "unknown")
        pusher = (payload.get("pusher") or {}).get("name", "unknown")
        commit_msg = head_commit.get("message", "").split("\n")[0][:80]

        log.info(f"Push fogadva: {commit_sha[:7]} '{commit_msg}' (pusher: {pusher})")

        # Deploy indítása háttérszálon
        thread = threading.Thread(
            target=run_deploy_async,
            args=(commit_sha, pusher),
            daemon=True,
        )
        thread.start()

        # Azonnal válaszolunk a GitHub-nak (a deploy háttérben fut)
        body = json.dumps({
            "status": "accepted",
            "commit": commit_sha[:7],
            "pusher": pusher,
            "message": commit_msg,
            "note": "Deploy indul a háttérben, a logok a /var/log/darts-webhook.log fájlban lesznek",
        }).encode()
        self.send_response(202)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    if not WEBHOOK_SECRET:
        log.error("A WEBHOOK_SECRET env változó kötelező. Indítsd a service-t a secret-et tartalmazó .env-ből.")
        sys.exit(1)

    # Ellenőrizzük, hogy a deploy script létezik és futtatható
    if not os.path.isfile(DEPLOY_SCRIPT):
        log.error(f"A deploy script nem található: {DEPLOY_SCRIPT}")
        sys.exit(1)
    if not os.access(DEPLOY_SCRIPT, os.X_OK):
        log.error(f"A deploy script nem futtatható: {DEPLOY_SCRIPT}")
        sys.exit(1)

    log.info(f"darts_webpage webhook service indul (port: {PORT}, deploy: {DEPLOY_SCRIPT})")
    server = HTTPServer(("127.0.0.1", PORT), WebhookHandler)
    log.info(f"Figyelem: {PORT} porton (Caddy reverse-proxy alatt)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Leállás...")
        server.shutdown()


if __name__ == "__main__":
    main()
