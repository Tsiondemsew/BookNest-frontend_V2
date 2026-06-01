import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';

export function queryPathFromRequest(request: Request, basePath: string) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return `${basePath}${query ? `?${query}` : ''}`;
}

/** Proxy to backend admin API and return JSON with the same status code. */
export async function jsonAdminBackend(path: string, init: RequestInit = {}) {
  const backendRes = await fetchAdminBackend(path, init);
  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
