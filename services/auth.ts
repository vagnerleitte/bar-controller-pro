import { db, DEFAULT_TENANT_ID } from './db';
import { User, UserRole } from '../types';

const encoder = new TextEncoder();
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'local').toLowerCase();
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const AUTH_SESSION_KEY = 'auth_session_v1';

interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user: User;
}

export function normalizeCPF(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCPF(value: string) {
  const digits = normalizeCPF(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, '$1.$2');
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
}

function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

async function digest(data: Uint8Array) {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return toBase64(hash);
}

export async function createPasswordHash(password: string) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const data = new Uint8Array([...saltBytes, ...encoder.encode(password)]);
  const passwordHash = await digest(data);
  return { passwordHash, passwordSalt: toBase64(saltBytes.buffer) };
}

export async function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const saltBytes = fromBase64(passwordSalt);
  const data = new Uint8Array([...saltBytes, ...encoder.encode(password)]);
  const computed = await digest(data);
  return computed === passwordHash;
}

export async function getUserByCPF(cpf: string) {
  const cpfNormalized = normalizeCPF(cpf);
  const directMatch = await db.users.get({ cpf: cpfNormalized });
  if (directMatch) return directMatch;

  // Backward compatibility for legacy records that may have masked CPF saved.
  const legacyMatch = await db.users
    .filter((user) => normalizeCPF(user.cpf) === cpfNormalized)
    .first();

  if (!legacyMatch) return null;

  if (legacyMatch.cpf !== cpfNormalized) {
    await db.users.put({ ...legacyMatch, cpf: cpfNormalized, updatedAt: Date.now() });
    return { ...legacyMatch, cpf: cpfNormalized };
  }

  return legacyMatch;
}

export async function login(cpf: string, password: string) {
  if (AUTH_MODE === 'api') {
    return loginViaApi(cpf, password);
  }
  return loginLocal(cpf, password);
}

async function loginLocal(cpf: string, password: string) {
  const user = await getUserByCPF(cpf);
  if (!user) {
    return { user: null, error: 'CPF não encontrado.' };
  }
  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) {
    return { user: null, error: 'Senha incorreta.' };
  }
  const normalizedUser = { ...user, tenantId: user.tenantId || DEFAULT_TENANT_ID };
  persistAuthSession({ user: normalizedUser });
  return { user: normalizedUser, error: null };
}

async function loginViaApi(cpf: string, password: string) {
  if (!API_BASE_URL) {
    return { user: null, error: 'API de autenticação não configurada.' };
  }
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: normalizeCPF(cpf),
        password
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message || payload?.error || 'Falha na autenticação.';
      return { user: null, error: String(message) };
    }

    const userData = payload?.user || payload?.data?.user || payload;
    const tokenData = payload?.tokens || payload?.data?.tokens || payload;
    const tenantId = userData?.tenantId || payload?.tenantId || DEFAULT_TENANT_ID;
    const now = Date.now();
    const user: User = {
      id: userData?.id || `u_${now}`,
      tenantId,
      name: userData?.name || 'Operador',
      cpf: normalizeCPF(userData?.cpf || cpf),
      role: userData?.role === 'seller' ? 'seller' : 'admin',
      // Campos mantidos para compatibilidade com o tipo User no app local.
      passwordHash: '',
      passwordSalt: '',
      createdAt: userData?.createdAt || now,
      updatedAt: now
    };

    persistAuthSession({
      accessToken: tokenData?.accessToken,
      refreshToken: tokenData?.refreshToken,
      expiresAt: tokenData?.expiresAt ? Number(tokenData.expiresAt) : undefined,
      user
    });
    return { user, error: null };
  } catch {
    return { user: null, error: 'Não foi possível conectar ao servidor.' };
  }
}

export async function createUser(params: {
  name: string;
  cpf: string;
  role: UserRole;
  password: string;
  tenantId: string;
}) {
  const cpfNormalized = normalizeCPF(params.cpf);
  const existing = await db.users.get({ cpf: cpfNormalized });
  if (existing) {
    return { user: null, error: 'CPF já cadastrado.' };
  }
  const now = Date.now();
  const { passwordHash, passwordSalt } = await createPasswordHash(params.password);
  const user: User = {
    id: `u_${now}`,
    tenantId: params.tenantId,
    name: params.name,
    cpf: cpfNormalized,
    role: params.role,
    passwordHash,
    passwordSalt,
    createdAt: now,
    updatedAt: now
  };
  await db.users.put(user);
  return { user, error: null };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const user = await db.users.get(userId);
  if (!user) return null;
  const updated = { ...user, role, updatedAt: Date.now() };
  await db.users.put(updated);
  return updated;
}

export async function resetUserPassword(userId: string, password: string) {
  const user = await db.users.get(userId);
  if (!user) return null;
  const { passwordHash, passwordSalt } = await createPasswordHash(password);
  const updated = { ...user, passwordHash, passwordSalt, updatedAt: Date.now() };
  await db.users.put(updated);
  return updated;
}

export async function ensureDefaultAdmin() {
  if (AUTH_MODE === 'api') return null;
  const count = await db.users.count();
  if (count > 0) return null;
  const now = Date.now();
  const { passwordHash, passwordSalt } = await createPasswordHash('admin123');
  const user: User = {
    id: `u_${now}`,
    tenantId: DEFAULT_TENANT_ID,
    name: 'Administrador',
    cpf: '00000000000',
    role: 'admin',
    passwordHash,
    passwordSalt,
    createdAt: now,
    updatedAt: now
  };
  await db.users.put(user);
  return user;
}

export function persistAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem('auth_user_id', session.user.id);
}

export function upsertSessionUser(user: User) {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    persistAuthSession({ user });
    return;
  }
  try {
    const current = JSON.parse(raw) as AuthSession;
    persistAuthSession({
      ...current,
      user
    });
  } catch {
    persistAuthSession({ user });
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem('auth_user_id');
}

export async function restoreAuthUser(allUsers: User[]) {
  if (AUTH_MODE === 'api') {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (!session?.user?.id) return null;
      return { ...session.user, tenantId: session.user.tenantId || DEFAULT_TENANT_ID };
    } catch {
      return null;
    }
  }

  const userId = localStorage.getItem('auth_user_id');
  if (!userId) return null;
  const user = allUsers.find(u => u.id === userId);
  return user ? { ...user, tenantId: user.tenantId || DEFAULT_TENANT_ID } : null;
}

export function isApiAuthMode() {
  return AUTH_MODE === 'api';
}
