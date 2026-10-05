// api.ts mirrors the backend's pkg/response.Envelope exactly — every
// service function's return type builds on ApiResponse<T> so a change in
// the backend's envelope shape is a single-file fix here, not a hunt
// through every feature.
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
  errors?: unknown;
}
