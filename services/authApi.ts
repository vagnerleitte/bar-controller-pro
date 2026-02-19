export interface AuthApiError {
  message: string;
}

export interface AuthApiTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthApiUser {
  id: string;
  name: string;
  role: 'admin' | 'seller';
  tenantId: string;
  cpf: string;
}

export interface AuthLoginResponse {
  user: AuthApiUser;
  tokens: AuthApiTokens;
}

export interface AuthRefreshResponse {
  tenantId: string;
  tokens: AuthApiTokens;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function request<T>(path: string, init: RequestInit) {
  if (!API_BASE_URL) {
    throw new Error('API de autenticação não configurada.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Falha na autenticação.';
    throw new Error(String(message));
  }
  return payload as T;
}

export async function loginWithEstablishment(params: { establishmentId: string; password: string }) {
  return request<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
}

export async function refreshAuthTokens(refreshToken: string) {
  return request<AuthRefreshResponse>('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
}

export async function logoutAuthSession(refreshToken: string) {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
}

export async function getMe(accessToken: string) {
  return request<AuthApiUser>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
