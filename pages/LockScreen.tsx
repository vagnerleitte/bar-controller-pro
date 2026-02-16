
import React, { useState } from 'react';
import { User } from '../types';
import { login, formatCPF, normalizeCPF } from '../services/auth';
import AppLogo from '../components/AppLogo';

interface LockScreenProps {
  onAuthSuccess: (user: User) => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onAuthSuccess }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (loading) return;
    setError(null);
    if (normalizeCPF(cpf).length !== 11 || password.trim().length < 4) {
      setError('Informe CPF válido e senha.');
      return;
    }
    setLoading(true);
    const { user, error } = await login(cpf, password);
    setLoading(false);
    if (!user) {
      setError(error || 'Falha no login.');
      return;
    }
    onAuthSuccess(user);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-lg shadow-primary/10">
            <AppLogo className="w-11 h-11" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-2">Acesso ao sistema</h1>
          <p className="text-white/50 text-sm">CPF e senha para entrar</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl w-full rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[10px] text-white/50 uppercase font-semibold tracking-widest">CPF</label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={formatCPF(cpf)}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/50 uppercase font-semibold tracking-widest">Senha</label>
              <input
                type="password"
                name="current-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-400 font-semibold">{error}</div>
          )}

          <button 
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
            <span className="material-icons-round text-sm">arrow_forward</span>
          </button>
          
          <div className="mt-6 text-white/40 text-[10px] font-medium text-center uppercase tracking-widest">
            Primeiro acesso: CPF 000.000.000-00 • senha admin123
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <span className="material-icons-round text-primary text-xs">shutter_speed</span>
            <span className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Offline First Storage</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/20 text-[10px] uppercase tracking-wider font-bold">
            <span className="material-icons-round text-xs">shield</span>
            <span>Dados criptografados localmente</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LockScreen;
