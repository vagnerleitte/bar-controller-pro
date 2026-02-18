
import React, { useRef, useState } from 'react';
import { User } from '../types';
import { login, formatCPF, normalizeCPF } from '../services/auth';
import { FormButton, FormInput, FormLabel } from '../components/form';

interface LockScreenProps {
  onAuthSuccess: (user: User) => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onAuthSuccess }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (loading) return;
    setError(null);
    const cpfRaw = cpfInputRef.current?.value ?? cpf;
    const passwordRaw = passwordInputRef.current?.value ?? password;
    setCpf(cpfRaw);
    setPassword(passwordRaw);

    if (normalizeCPF(cpfRaw).length !== 11 || passwordRaw.trim().length < 4) {
      setError('Informe CPF válido e senha.');
      return;
    }
    setLoading(true);
    const { user, error } = await login(cpfRaw, passwordRaw);
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
        <img
          src="/lockscreen-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/35 via-background-dark/60 to-background-dark/80"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="text-center mb-10">
          <img src="/lockscreen-logo.svg" alt="Caderinho de bar" className="w-[216px] mx-auto mb-4" />
          <h1 className="text-white text-[12px] font-bold tracking-tight mb-2">Acesso ao sistema</h1>
          <p className="text-white/50 text-sm">CPF e senha para entrar</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl w-full rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="space-y-4 mb-6">
            <div>
              <FormLabel>CPF</FormLabel>
              <FormInput
                ref={cpfInputRef}
                type="text"
                name="username"
                autoComplete="username"
                value={formatCPF(cpf)}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="mt-2"
              />
            </div>
            <div>
              <FormLabel>Senha</FormLabel>
              <div className="relative mt-2">
                <FormInput
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  name="current-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-white/60 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <span className="material-icons-round text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-400 font-semibold">{error}</div>
          )}

          <FormButton 
            onClick={handleSubmit}
            className="w-full py-4 shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
            <span className="material-icons-round text-sm">arrow_forward</span>
          </FormButton>
          
          <div className="mt-6 text-[#F2F0E6] text-[13px] font-medium text-center">
            Não possui conta?{' '}
            <button
              type="button"
              className="text-[#F4C430] font-semibold hover:brightness-110 transition"
            >
              cadastre-se
            </button>
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
