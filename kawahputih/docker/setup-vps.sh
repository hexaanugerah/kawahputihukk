#!/usr/bin/env bash
# Setup awal VPS Ubuntu untuk Sistem Booking Tiket Kawah Putih.
# Jalankan sebagai root di server kosong:
#   bash <(curl -fsSL https://raw.githubusercontent.com/hexaanugerah/kawahputihukk/main/kawahputih/docker/setup-vps.sh)
# atau clone dulu lalu: bash kawahputih/docker/setup-vps.sh

set -e
REPO_URL="https://github.com/hexaanugerah/kawahputihukk"
APP_DIR="/opt/kawahputihukk"

echo "== 1/4 Docker & dependensi =="
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl git
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi
docker info >/dev/null 2>&1 || { echo "Docker engine tidak jalan"; exit 1; }
echo "   docker siap: $(docker --version)"

echo "== 2/4 Ambil kode dari GitHub =="
if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR" && git pull --ff-only
fi

echo "== 3/4 Siapkan prod.env =="
cd "$APP_DIR/kawahputih/docker"
if [ ! -f prod.env ]; then
  cp prod.env.example prod.env
  echo "   prod.env dibuat. EDIT FILE INI SEBELUM LANJUT:"
  echo "     nano $APP_DIR/kawahputih/docker/prod.env"
  echo "   Wajib diisi: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MYSQL_ROOT_PASSWORD,"
  echo "   DB_PASSWORD, MIDTRANS_SERVER_KEY, BACKEND_PUBLIC_URL, FRONTEND_URL."
  echo "   Generate secret: openssl rand -base64 48"
  exit 0
fi

echo "== 4/4 Jalankan stack =="
docker compose -f docker-compose.prod.yml up -d
sleep 5
docker compose -f docker-compose.prod.yml ps
echo ""
echo "Cek kesehatan setelah ~30 detik: curl http://127.0.0.1:8080/healthz"
echo "Log backend: docker compose -f docker-compose.prod.yml logs -f backend"
