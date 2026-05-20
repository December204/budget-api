export interface PagedMeta {
  total: number;
  page: number;
  limit: number;
}

export function buildResponse<T>(data: T, meta: Record<string, unknown> = {}): { data: T; meta: Record<string, unknown> } {
  return { data, meta };
}

export function buildPagedResponse<T>(data: T[], meta: PagedMeta): { data: T[]; meta: PagedMeta } {
  return { data, meta };
}
