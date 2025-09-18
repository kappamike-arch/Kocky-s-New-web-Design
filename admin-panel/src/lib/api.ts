// src/lib/api.ts
const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://staging.kockys.com/api";

// Helper to get auth token from cookies or localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try cookies first using js-cookie
  try {
    const Cookies = require('js-cookie');
    const cookieToken = Cookies.get('auth-token');
    if (cookieToken) {
      return cookieToken;
    }
  } catch (e) {
    // Fallback to manual cookie parsing
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return value;
      }
    }
  }
  
  // Fallback to localStorage
  return localStorage.getItem('auth-token') || localStorage.getItem('access_token');
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 
    "Content-Type": "application/json", 
    ...(init.headers || {}) 
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    headers,
    cache: "no-store",
    ...init,
  });
  if (res.status === 401) {
    // do not crash render; let caller redirect
    throw new Error("UNAUTHORIZED");
  }
  try { return (await res.json()) as T; } catch { return {} as T; }
}

export const ensureArray = <T,>(v: any): T[] => (Array.isArray(v) ? v as T[] : []);

// Typed response interfaces for different API endpoints
export type ListResp<T> = { items?: T[] } | { campaigns?: T[] } | { templates?: T[] } | { contacts?: T[] } | any;

// Helper function to extract arrays from various response formats
export const extractArray = <T>(resp: ListResp<T>, fallback: T[] = []): T[] => {
  if (Array.isArray(resp)) return resp;
  if (resp?.items) return ensureArray<T>(resp.items);
  if (resp?.campaigns) return ensureArray<T>(resp.campaigns);
  if (resp?.templates) return ensureArray<T>(resp.templates);
  if (resp?.contacts) return ensureArray<T>(resp.contacts);
  if (resp?.data?.items) return ensureArray<T>(resp.data.items);
  if (resp?.data?.campaigns) return ensureArray<T>(resp.data.campaigns);
  if (resp?.data?.templates) return ensureArray<T>(resp.data.templates);
  if (resp?.data?.contacts) return ensureArray<T>(resp.data.contacts);
  return fallback;
};