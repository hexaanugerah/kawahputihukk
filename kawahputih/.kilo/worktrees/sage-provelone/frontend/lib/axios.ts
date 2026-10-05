// ============================================================================
// AXIOS — instans tunggal untuk MASA DEPAN ketika backend nyata dipakai.
// Mode mock saat ini tidak memakai axios sama sekali (semua service membaca
// mock DB), jadi file ini disederhanakan agar tidak bergantung pada shape
// auth store mock. Ketika beralih ke backend: pulihkan interceptor token
// dari git history dan pasang kembali accessToken/refreshToken di store.
// ============================================================================

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});
