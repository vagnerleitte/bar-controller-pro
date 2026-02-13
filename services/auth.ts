import { db } from './db';
import { User, UserRole } from '../types';

const encoder = new TextEncoder();

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
  return db.users.get({ cpf: normalizeCPF(cpf) });
}

export async function login(cpf: string, password: string) {
  const user = await getUserByCPF(cpf);
  if (!user) {
    return { user: null, error: 'CPF não encontrado.' };
  }
  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) {
    return { user: null, error: 'Senha incorreta.' };
  }
  return { user, error: null };
}

export async function createUser(params: {
  name: string;
  cpf: string;
  role: UserRole;
  password: string;
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
  const count = await db.users.count();
  if (count > 0) return null;
  const now = Date.now();
  const { passwordHash, passwordSalt } = await createPasswordHash('admin123');
  const user: User = {
    id: `u_${now}`,
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
