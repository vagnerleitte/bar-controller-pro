import { db, DEFAULT_TENANT_ID } from './db';
import { User, UserRole } from '../types';
import { loginWithEstablishment, logoutAuthSession } from './authApi';

const encoder = new TextEncoder();
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'local').toLowerCase();
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
  try {
    const payload = await loginWithEstablishment({
      establishmentId: cpf.trim(),
      password
    });
    const userData = payload.user;
    const tokenData = payload.tokens;
    const tenantId = userData?.tenantId || DEFAULT_TENANT_ID;
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.';
    return { user: null, error: message };
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

function readStoredSession() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function logout() {
  const session = readStoredSession();
  if (AUTH_MODE === 'api' && session?.refreshToken) {
    try {
      await logoutAuthSession(session.refreshToken);
    } catch {
      // Non-blocking logout call.
    }
  }
  clearAuthSession();
}

export async function restoreAuthUser(allUsers: User[]) {
  const readSessionUser = () => {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (!session?.user?.id) return null;
      return { ...session.user, tenantId: session.user.tenantId || DEFAULT_TENANT_ID };
    } catch {
      return null;
    }
  };

  if (AUTH_MODE === 'api') {
    return readSessionUser();
  }

  const userId = localStorage.getItem('auth_user_id');
  if (userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      const normalized = { ...user, tenantId: user.tenantId || DEFAULT_TENANT_ID };
      upsertSessionUser(normalized);
      return normalized;
    }
  }

  const sessionUser = readSessionUser();
  if (!sessionUser) return null;
  const syncedUser = allUsers.find(u => u.id === sessionUser.id);
  const resolved = syncedUser
    ? { ...syncedUser, tenantId: syncedUser.tenantId || DEFAULT_TENANT_ID }
    : sessionUser;
  localStorage.setItem('auth_user_id', resolved.id);
  upsertSessionUser(resolved);
  return resolved;
}

export function isApiAuthMode() {
  return AUTH_MODE === 'api';
}
