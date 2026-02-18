import React, { useMemo, useState } from 'react';
import { AppState, User, UserRole } from '../types';
import BottomNav from '../components/BottomNav';
import { createUser, formatCPF, normalizeCPF, resetUserPassword, updateUserRole } from '../services/auth';
import AppLogo from '../components/AppLogo';
import { FormButton, FormInput, FormSelect } from '../components/form';

interface UsersProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
}

const Users: React.FC<UsersProps> = ({ navigate, users, setUsers, currentUser }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canManage = currentUser?.role === 'admin';

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const handleCreate = async () => {
    if (!canManage || saving) return;
    setError(null);
    if (name.trim().length < 3 || normalizeCPF(cpf).length !== 11 || password.trim().length < 4) {
      setError('Preencha nome, CPF válido e senha (min 4).');
      return;
    }
    setSaving(true);
    const { user, error } = await createUser({
      name,
      cpf,
      role,
      password,
      tenantId: currentUser?.tenantId || 't1'
    });
    setSaving(false);
    if (!user) {
      setError(error || 'Falha ao criar usuário.');
      return;
    }
    setUsers(prev => [...prev, user]);
    setName('');
    setCpf('');
    setPassword('');
    setRole('seller');
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!canManage) return;
    const updated = await updateUserRole(userId, newRole);
    if (!updated) return;
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
  };

  const handleResetPassword = async (userId: string) => {
    if (!canManage) return;
    const newPassword = prompt('Nova senha (mín 4 caracteres):');
    if (!newPassword || newPassword.trim().length < 4) return;
    const updated = await resetUserPassword(userId, newPassword.trim());
    if (!updated) return;
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AppLogo className="w-9 h-9" />
              <h1 className="text-[12px] font-extrabold tracking-tight">Usuários</h1>
            </div>
            <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-0.5">Admin e vendedores</p>
          </div>
          <button
            onClick={() => navigate('home')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <span className="material-icons-round text-xl">arrow_back</span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Novo usuário</h2>
          <div className="grid grid-cols-1 gap-3">
            <FormInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              disabled={!canManage}
            />
            <FormInput
              type="text"
              value={formatCPF(cpf)}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="CPF"
              disabled={!canManage}
            />
            <FormSelect
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={!canManage}
            >
              <option value="seller">Vendedor</option>
              <option value="admin">Admin</option>
            </FormSelect>
            <FormInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              disabled={!canManage}
            />
          </div>
          {error && <div className="text-xs text-red-400 font-semibold">{error}</div>}
          <FormButton
            onClick={handleCreate}
            disabled={!canManage || saving}
            className="w-full shadow-lg shadow-primary/20"
          >
            {saving ? 'Salvando...' : 'Criar usuário'}
          </FormButton>
          {!canManage && (
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              Somente administradores podem criar usuários.
            </div>
          )}
        </section>

        <section className="space-y-3">
          {sortedUsers.map(user => (
            <div
              key={user.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-sm">{user.name}</p>
                <p className="text-[10px] text-white/40 uppercase font-medium">CPF: {formatCPF(user.cpf)}</p>
                <p className="text-[10px] text-primary/70 uppercase font-semibold mt-1">{user.role === 'admin' ? 'Admin' : 'Vendedor'}</p>
              </div>
              <div className="flex items-center gap-2">
                <FormSelect
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  className="rounded-lg px-2 py-1 text-[10px]"
                  disabled={!canManage || user.id === currentUser?.id}
                >
                  <option value="seller">Vendedor</option>
                  <option value="admin">Admin</option>
                </FormSelect>
                <FormButton
                  onClick={() => handleResetPassword(user.id)}
                  disabled={!canManage}
                  variant="link"
                  tone="primary"
                  className="text-[10px] font-bold uppercase tracking-widest px-0 py-0"
                >
                  Resetar senha
                </FormButton>
              </div>
            </div>
          ))}
          {sortedUsers.length === 0 && (
            <div className="text-center text-white/40 text-sm">Nenhum usuário cadastrado.</div>
          )}
        </section>
      </main>

      <BottomNav activePage="users" navigate={navigate} currentUserRole={currentUser?.role} />
    </div>
  );
};

export default Users;
