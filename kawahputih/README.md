# Kawah Putih Rancabali Tourism Management System — Backend (Part 2.2 rebuild)

## Status yang jujur perlu kamu tahu

Ini adalah **rebuild backend dari nol**, langsung ke struktur final Part 2.2
(domain-based: `internal/domain/<name>/{entity,repository,service,usecase,
handler,dto,validator,routes,errors,mapper}.go`), setelah sesi kerja
sebelumnya (yang sudah membangun Fase 0-2 + reorganisasi Part 2.1) hilang
karena reset lingkungan kerja saya di tengah proses migrasi.

**Yang ada di paket ini:** backend Go lengkap, 7 domain, fitur setara
Fase 0-2 sebelumnya (auth+RBAC+OAuth+verifikasi email+reset password,
CMS artikel+galeri, tourism package, booking+payment Midtrans+QR
ticket+check-in), plus infrastruktur baru yang diminta Part 2.2 (Redis
cache, scheduler expired-booking, struktur cmd/ dengan 4 binary).

**Yang TIDAK ada di paket ini:** folder `frontend/` (Next.js). Part 2.2
yang kamu berikan eksplisit hanya membahas backend — dokumen itu sendiri
bilang "NEXT: PART 2.3 — Frontend Enterprise Folder Structure" di
akhir, jadi frontend belum diminta ulang. Kalau kamu masih punya frontend
dari paket sebelumnya, backend ini tetap kompatibel (kontrak API/DTO tidak
berubah). Kalau tidak, beri tahu saya dan saya bangun ulang juga.

**Belum ditest end-to-end** (`go build` belum pernah dijalankan di paket
ini — lingkungan saya tidak punya akses ke proxy Go untuk `go mod
download`). Kemungkinan ada 1-2 typo/unused-import yang baru ketahuan saat
build pertama kali. Jalankan `go build ./...` di `backend/` begitu kamu
terima paket ini, dan kirim pesan errornya ke saya kalau ada — akan lebih
cepat diperbaiki daripada saya menebak.

## Struktur (Part 2.2)

```
backend/
├── cmd/
│   ├── server/       # entrypoint utama (main.go, bootstrap.go, server.go, router.go)
│   ├── worker/       # placeholder — belum ada job async yang butuh ini
│   ├── scheduler/    # binary terpisah utk expired-booking sweeper (opsional, jalan juga inline di server)
│   └── migration/    # placeholder — migration pakai SQL polos, lihat database/migrations/
├── internal/
│   ├── domain/
│   │   ├── auth/         # 10 file: entity, repository, service, usecase, handler, dto, validator, routes, errors, mapper
│   │   ├── role/         # sama, + join-table pattern biar tidak import auth.User
│   │   ├── user/         # staff management (admin activate/deactivate)
│   │   ├── article/      # CMS artikel, state machine draft->published->archived
│   │   ├── gallery/      # galeri per kategori
│   │   ├── package/      # tourism package (folder "package", Go package "tourismpackage")
│   │   └── booking/      # booking + payment + QR ticket + check-in
│   ├── bootstrap/    # SATU-SATUNYA tempat yang import semua domain & menyambungkannya
│   ├── routes/       # aggregator RegisterRoutes tiap domain
│   ├── middleware/   # auth guard, RBAC, rate limiter, CORS, request ID, logger, recovery
│   ├── config/       # env config + bootstrap DB/Redis
│   ├── cache/        # BARU — Redis wrapper (belum dipakai domain manapun, siap dipakai)
│   ├── scheduler/    # expired_booking sweeper
│   └── payment/midtrans/  # payment gateway adapter
├── pkg/              # response, apperror, logger, jwtutil, mailer, slugutil — dipakai lintas domain
└── database/migrations/  # SQL polos, 001-004, jalan otomatis via Docker

database/migrations/  # (di root, bukan di dalam backend/ — ikut struktur Part 2.1 sebelumnya)
docker/                # backend.Dockerfile, docker-compose.yml
```

## Kenapa setiap domain sama persis strukturnya (auth, role, user, article, gallery, package, booking)

Ini konsekuensi langsung dari instruksi Part 2.2: *"Every domain MUST have
the same structure."* Untuk domain sederhana (gallery, package), `usecase.go`
jadi pass-through tipis ke `service.go` — sengaja dibiarkan begitu (bukan
dihapus) demi konsistensi struktur, meskipun secara individual domain itu
"tidak butuh" layer usecase terpisah.

## Kenapa domain tidak saling import

Setiap domain independen secara Go-import-graph:
- `auth` butuh assign role default → didefinisikan sebagai interface
  `auth.RoleProvider` yang dipuaskan `role.Service` **secara struktural**
  (duck typing Go), bukan lewat import langsung
- `booking` butuh harga paket → interface `booking.PackagePricingProvider`,
  dipuaskan lewat adapter kecil di `bootstrap.go`
- `role` butuh assign role ke user → tidak import `auth.User`, cuma
  operasi tabel `user_roles` mentah lewat `db.Table(...)`

Satu-satunya file yang "tahu" semua domain ada adalah `internal/bootstrap/bootstrap.go`
dan `internal/routes/routes.go` — sesuai prinsip dependency injection terpusat
di Part 2.2.

## Kenapa `booking` kehilangan sebagian jaminan keamanan dari versi DDD sebelumnya

Versi sebelumnya (sebelum migrasi ke Part 2.2) memakai DDD aggregate:
`Booking` punya field private, satu-satunya cara ubah status lewat method
(`ConfirmPayment()`, `Cancel()`, dst) — dijamin compiler, tidak mungkin
dilanggar dari luar package.

Part 2.2 eksplisit bilang *"Entity contains GORM Model only, no business
logic"* — jadi field `Booking.Status` sekarang publik dan bisa diubah
langsung dari mana saja di dalam package `booking`. Saya pindahkan aturan
transisi status ke `service.go`, tapi ini sekarang **disiplin code
review**, bukan jaminan compiler. Ini trade-off nyata dari migrasi ini,
saya tulis eksplisit di komentar `entity.go` juga.

## Setup

```bash
cp backend/.env.example backend/.env
# isi MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY kalau mau test booking+payment
# isi GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET kalau mau test Google login

docker compose -f docker/docker-compose.yml up --build
# Backend: http://localhost:8080/healthz
```

Akun admin/super_admin/finance_admin/staff pertama tidak bisa dibuat lewat
endpoint publik (sengaja). Assign manual:
```sql
INSERT INTO user_roles (user_id, role_id) VALUES ('<uuid>', '00000000-0000-0000-0000-000000000001'); -- admin
INSERT INTO user_roles (user_id, role_id) VALUES ('<uuid>', '00000000-0000-0000-0000-000000000005'); -- super_admin
INSERT INTO user_roles (user_id, role_id) VALUES ('<uuid>', '00000000-0000-0000-0000-000000000007'); -- finance_admin
```

## Roadmap

| Bagian | Status |
|---|---|
| Backend 7 domain (Part 2.2) | ✅ Selesai, belum di-build/test |
| Frontend (Part 2.1 struktur lama) | ❌ Hilang, belum dibangun ulang |
| Part 2.3 (Frontend Enterprise Folder Structure) | Menunggu kamu share dokumennya |
| Review, Wishlist, Promotion, Event, Notification (dulu "Fase 3") | Belum, nunggu backend ini stabil dulu |

## Update Part 2.6 — REST API Standard

Perubahan yang diterapkan agar sesuai Part 2.6:

1. **Validation error sekarang HTTP 422**, bukan 400, dengan format array
   `errors: [{field, message}]` (bukan map). Semua 7 domain sudah diupdate:
   `validator.go` mengembalikan `[]response.FieldError`, handler memanggil
   `response.ValidationFailed(c, errs)`.
2. **Error code katalog** (`AUTH_001`, `AUTH_002`, `USER_001`, `BOOKING_001`,
   `BOOKING_002`, `DESTINATION_001`) ditambahkan lewat `AppError.WithCode(...)`
   pada variabel error yang relevan — dipasang saat deklarasi var (bukan saat
   request) supaya aman dipakai bersamaan oleh banyak goroutine. Field
   `code` muncul di response JSON hanya untuk error yang punya kode.
   **Belum diimplementasi**: `PAYMENT_001`/`PAYMENT_002` — tidak ada
   path error yang cukup spesifik untuk keduanya saat ini (kegagalan
   Midtrans langsung jadi `apperror.Internal`, generik). Ditandai jujur,
   bukan dipaksakan.
3. **Pagination param berubah dari `per_page` ke `limit`**, dan field
   response meta dari `per_page`/`total_items` ke `limit`/`total` — persis
   sesuai Part 2.6. Frontend sudah disesuaikan penuh (services, hooks, tipe
   `ApiMeta`).
4. **Webhook Midtrans pindah** dari `/api/v1/payments/midtrans/notification`
   ke `/api/v1/webhooks/midtrans`. **Kalau kamu sudah daftarkan URL lama di
   dashboard sandbox Midtrans, update ke path baru.**
5. **Rate limit bertingkat per role** (`internal/middleware/TieredRateLimit`):
   Guest 60/menit (per IP), User 120/menit (per user ID), Admin/Super Admin
   300/menit (per user ID) — berlaku global di semua endpoint. Ini terpisah
   dari limit ketat khusus di `/auth/login` dkk (itu untuk anti brute-force,
   bukan throughput umum) — keduanya jalan bersamaan.

### Keterbatasan yang jujur perlu diketahui

- **Frontend belum menampilkan field-error per-input dari 422** — semua
  form saat ini cuma menampilkan `message` generik di atas form (lewat
  `setError("root", ...)`), tidak membaca array `errors[].field` untuk
  highlight input yang salah satu-per-satu. Backend sudah siap
  (`errors: [{field, message}]`), tinggal frontend-nya yang perlu di-wire
  kalau mau pengalaman form yang lebih presisi.
- Field selection (`?fields=`), include relasi (`?include=`), dan filter
  generik (`?sort=`, `?min_price=`, dst) dari Part 2.6 **belum
  diimplementasikan** — endpoint yang ada saat ini cukup sederhana
  (list/get/create/update/delete) sehingga belum butuh query DSL
  selengkap itu. Ditambahkan kalau ada endpoint nyata yang butuh.

## Update Part 3.1 — Enterprise Database Architecture

Perubahan yang diterapkan (migration `005_part31_retrofit`):

1. **Rename unique key**: `uq_*` → `uk_*` di semua tabel (`ALTER TABLE ... RENAME KEY`,
   bukan drop+recreate — data dan index tidak disentuh).
2. **Kolom audit** (`created_by`/`updated_by`/`deleted_by`) ditambahkan ke
   `users`, `roles`, `permissions`, `articles`, `gallery_items`,
   `tourism_packages`, `bookings` — **dan diwiring penuh** di kode Go
   (bukan cuma kolom kosong): domain `article`, `gallery`, `package`, `user`
   sekarang mencatat siapa yang membuat/mengubah/menghapus data lewat
   `middleware.CurrentUserID(c)` yang diteruskan dari handler → usecase →
   service → entity.
   - Tidak ada FK constraint di kolom-kolom ini (sengaja) — user pertama
     di sistem tidak mungkin punya `created_by` yang valid (belum ada user
     lain), jadi kolom ini diindeks saja, bukan di-FK.
3. **FULLTEXT INDEX** di `articles(title, excerpt, content)` sesuai
   `idx_article_search` yang dicontohkan Part 3.1.
4. **Collation eksplisit** `utf8mb4_unicode_ci` di semua tabel (sebelumnya
   cuma `CHARSET=utf8mb4` tanpa collation eksplisit, jadi ikut default
   MySQL 8 yaitu `utf8mb4_0900_ai_ci`).
5. **Nama database** diganti dari `kpr_tourism` ke `kawah_putih_db` (default
   di `.env.example`, `docker-compose.yml`, dan fallback di `config.go`).
6. **Timezone eksplisit `Asia/Jakarta`** — DSN Go tidak lagi pakai `loc=Local`
   (ikut timezone host, tidak portable), dan container MySQL diset
   `TZ=Asia/Jakarta` + `--default-time-zone=+07:00`.

### Yang jujur TIDAK dikerjakan

- **~66 dari ~70 tabel yang diestimasikan Part 3.1** tidak dibuat — itu
  untuk modul yang backend-nya belum ada (destinasi terpisah dari paket,
  kategori, fasilitas, tiket terpisah dari booking, refund, voucher,
  notifikasi, audit log, settings, weather cache, visitor statistics).
  Menambah tabel kosong tanpa kode di baliknya cuma menambah utang teknis.
- **Kolom `status` generik** (`ACTIVE`/`INACTIVE`/`DRAFT`/dst di semua
  tabel) **tidak dipaksakan** — tabel yang sudah punya representasi status
  yang lebih tepat (mis. `users.is_active` boolean, `bookings.status`
  enum spesifik per-domain, `tourism_packages.is_active` boolean) tetap
  dipertahankan apa adanya. Mengganti semua jadi satu kolom status generik
  string akan kehilangan presisi (mis. `bookings.status` punya 5 nilai
  spesifik: pending_payment/paid/cancelled/expired/checked_in — bukan
  cuma "active/inactive").
- Domain `role`/`booking` **dapat kolom audit di skema, tapi tidak semua
  diwiring ke kode**: `roles`/`permissions` itu data seed, jarang
  diubah lewat aplikasi (tidak ada endpoint CRUD role/permission,
  cuma assign ke user); `bookings.updated_by`/`deleted_by` ada di skema
  untuk kelengkapan tapi belum dipakai karena booking tidak punya alur
  admin-edit — `user_id` (pemesan) dan `checked_in_by` (staff yang
  check-in) sudah lebih deskriptif untuk kebutuhan audit booking saat ini.
