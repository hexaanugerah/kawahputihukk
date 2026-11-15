# Sistem Booking Tiket Kawah Putih

Aplikasi web pemesanan tiket wisata Kawah Putih. Pengunjung bisa melihat katalog destinasi dan paket, memesan tiket per tanggal kunjungan, membayar lewat jalur pembayaran terpusat (Midtrans atau transfer/QRIS), lalu masuk gerbang dengan e-tiket QR. Pengelola mendapat dashboard untuk admin, manager, dan petugas, lengkap dengan monitoring dan laporan pendapatan.

[![CI](https://github.com/hexaanugerah/kawahputihukk/actions/workflows/ci.yml/badge.svg)](https://github.com/hexaanugerah/kawahputihukk/actions/workflows/ci.yml)

## Fitur

- Registrasi dengan verifikasi email otomatis, login/refresh/logout JWT, lupa dan ganti password, login Google (opsional)
- Booking tiket per jenis dan tanggal, kuota diamankan dengan transaksi dan lock di database supaya tidak bisa double booking
- Pembayaran terpusat: Midtrans (webhook diverifikasi signature-nya), tujuan transfer/QRIS yang dikelola admin, unggah bukti transfer
- E-tiket QR yang bisa dicetak PDF, dipindai petugas di gerbang, lengkap dengan riwayat dan statistik scan
- Konten publik: destinasi, paket, artikel, galeri, banner/event, fasilitas, FAQ, aturan pengunjung, review
- Dashboard admin (kelola semuanya + jejak audit), manager (monitoring, revenue, penjualan, pengunjung), petugas (scan, history, tiket)
- Rate limiting bertingkat berbasis Redis, CORS multi-origin, seed staff tanpa password bawaan

## Teknologi

- **Backend**: Go 1.23, Gin, GORM, MySQL, Redis, JWT, Midtrans, Zap
- **Frontend**: Next.js 15, React 18, React Query, Zustand, Tailwind CSS, qrcode/jsqr, jsPDF
- **Deploy**: Docker Compose, GitHub Actions (build CI + publish image ke GHCR)

## Struktur repo

```
kawahputih/
  backend/              API Go (cmd, internal/domain 18 modul, pkg)
  frontend/             Next.js 15 (app/(public|auth|dashboard|admin|manager|petugas))
  database/migrations/  SQL up/down: schema, seed, centralized payment
  docker/               docker-compose.yml, backend.Dockerfile, backend-issues.yaml
ERD.drawio              diagram relasi database
```

## Cara menjalankan

### Backend

```bash
cd kawahputih/backend
cp .env.example .env      # sesuaikan DB dan secrets
go run ./cmd/server       # migrasi + seed otomatis saat start
# API di http://localhost:8080, cek kesehatan: /healthz
```

### Frontend

```bash
cd kawahputih/frontend
npm ci
cp .env.example .env.local   # arahkan ke API backend
npm run dev -H 0.0.0.0    # http://localhost:3000 (HP bisa akses via IP LAN)
```

### Docker (Redis + backend)

```bash
cd kawahputih/docker
docker compose up -d --build
```

## Deployment

Setiap push ke `main` menjalankan dua workflow GitHub Actions:

- **CI** - mem-build backend (Go) dan frontend (Next.js) di mesin bersih
- **Docker publish** - mem-build image backend dan men-push-nya ke GHCR:

```bash
docker pull ghcr.io/hexaanugerah/kawahputih-backend:latest
```

Untuk menjalankan di server, siapkan file `.env` lengkap (DB, JWT secrets, Midtrans, SMTP) lalu jalankan image tersebut dengan `--env-file .env`. Backend menolak start di mode production kalau secrets atau database tidak lengkap; migrasi schema berjalan otomatis saat startup.

## Keamanan

- Jangan pernah commit `.env`. `MIDTRANS_SERVER_KEY` dan JWT secrets hanya boleh ada di environment server
- Password akun staff dibuat lewat variabel `SEED_*_PASSWORD` - tidak ada password bawaan
- Frontend tidak pernah menyentuh kredensial merchant; semua pembayaran lewat backend

## Kontributor

Tim UKK Kawah Putih.
