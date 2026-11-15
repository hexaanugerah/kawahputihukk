# 📋 Daftar Tugas Job Sheet

> **Proyek:** Sistem Booking Tiket Kawah Putih
> **Repository:** [hexaanugerah/kawahputihukk](https://github.com/hexaanugerah/kawahputihukk)
> **Fase:** Sprint 1 — Release Preparation & Demo
> **Status:** ☐ = belum selesai · ☑ = selesai

**Progress:** 0 dari 8 selesai (0%)

---

## ✅ Checklist Tugas

| No | Status | Tugas | Keterangan |
|----|--------|-------|------------|
| 1 | ☐ | **Final Bug Fixing (Release Candidate)** | Test seluruh fitur utama, catat & perbaiki bug prioritas tinggi, siapkan build release candidate |
| 2 | ☐ | **Production / Staging Deployment** | Deploy aplikasi ke server staging/production, verifikasi konfigurasi environment (DB, Midtrans, JWT) |
| 3 | ☐ | **Project Documentation (Manual/Tech Docs)** | Susun manual pengguna & dokumentasi teknis (arsitektur, setup, alur bisnis) |
| 4 | ☐ | **Repository README Lengkap** | Lengkapi README root: deskripsi proyek, fitur, cara install/run, screenshot, struktur folder |
| 5 | ☐ | **API Documentation** | Dokumentasi seluruh endpoint: method, path, request/response, autentikasi, contoh payload |
| 6 | ☐ | **Persiapan Slide Presentasi** | Finalisasi slide presentasi: latar belakang, fitur, demo flow, arsitektur, penutup |
| 7 | ☐ | **Demo Rehearsal (Latihan Demo)** | Latihan alur demo end-to-end, siapkan data dummy yang rapi, antisipasi pertanyaan |
| 8 | ☐ | **Persiapan Pertanggungjawaban Individu** | Tiap anggota siap menjelaskan kontribusi & bagian kode yang dikerjakan sendiri |

---

## 📌 Checklist Interaktif

- [ ] Final Bug Fixing (Release Candidate)
- [ ] Production / Staging Deployment
- [ ] Project Documentation (Manual/Tech Docs)
- [ ] Repository README Lengkap
- [ ] API Documentation
- [ ] Persiapan Slide Presentasi
- [ ] Demo Rehearsal (Latihan Demo)
- [ ] Persiapan Pertanggungjawaban Individu

---

## 🗂️ Detail Per Tugas

### 1. Final Bug Fixing (Release Candidate)
- [ ] Uji semua fitur utama (booking, pembayaran, artikel, dashboard staff)
- [ ] Kumpulkan bug dari hasil testing internal
- [ ] Perbaiki bug prioritas tinggi → sedang → rendah
- [ ] Regresi test setelah perbaikan (`go test ./...` untuk backend)
- [ ] Tag versi release candidate (misal `v1.0.0-rc.1`)

### 2. Production / Staging Deployment
- [ ] Siapkan server / hosting (staging atau production)
- [ ] Set `APP_ENV=staging` / `production` beserta semua secrets
- [ ] Konfigurasi MySQL production & jalankan migrasi schema
- [ ] Verifikasi Midtrans (`MIDTRANS_IS_PRODUCTION`) & webhook
- [ ] Smoke test endpoint utama di server

### 3. Project Documentation (Manual/Tech Docs)
- [ ] Manual pengguna (customer & staff)
- [ ] Dokumen arsitektur sistem (backend Go, frontend, database)
- [ ] Panduan setup lokal developer baru
- [ ] Diagram ERD & alur bisnis (lihat `ERD.drawio`)

### 4. Repository README Lengkap
- [ ] Deskripsi & latar belakang proyek
- [ ] Daftar fitur utama + screenshot
- [ ] Cara install & menjalankan (backend + frontend)
- [ ] Struktur folder & tech stack
- [ ] Lisensi & kontributor

### 5. API Documentation
- [ ] Daftar semua endpoint per domain (auth, booking, payment, article, analytics, dll)
- [ ] Method, path, dan deskripsi tiap endpoint
- [ ] Format request/response + contoh payload
- [ ] Skema autentikasi (JWT access & refresh token)
- [ ] Kode error & penjelasannya

### 6. Persiapan Slide Presentasi
- [ ] Struktur slide: intro → masalah → solusi → fitur → demo → arsitektur → penutup
- [ ] Finalisasi file `booking_tiket_kawah_putih.pptx`
- [ ] Siapkan screenshot/gambar pendukung
- [ ] Latihan timing presentasi

### 7. Demo Rehearsal (Latihan Demo)
- [ ] Tentukan alur demo end-to-end (dari login sampai pembayaran)
- [ ] Siapkan data dummy yang bersih & konsisten
- [ ] Latihan minimal 2x dengan seluruh tim
- [ ] Siapkan rencana cadangan bila demo gagal (video/screenshot)

### 8. Persiapan Pertanggungjawaban Individu
- [ ] Tiap anggota menuliskan kontribusi pribadinya
- [ ] Tiap anggota paham bagian kode yang dia kerjakan
- [ ] Siap jawab pertanyaan teknis dari penguji/asesor
- [ ] Review silang kontribusi antar anggota

---

*Tanggal dibuat: 15 November 2026 · Diperbarui otomatis melalui commit GitHub*
