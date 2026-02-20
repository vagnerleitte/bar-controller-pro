import React, { useState } from 'react';
import { AppState, User } from '../types';
import AppTopBar from '../components/AppTopBar';

interface ProfileProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  currentUser: User | null;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ navigate, currentUser, privacyMode, setPrivacyMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const initials = (currentUser?.name || 'Perfil')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pb-20">
      <AppTopBar
        title="Perfil"
        onBack={() => navigate('home')}
        rightSlot={(
          <>
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center"
              title={privacyMode ? 'Mostrar valores' : 'Ocultar valores'}
            >
              <span className="material-icons-round text-[20px]">{privacyMode ? 'visibility' : 'visibility_off'}</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(previous => !previous)}
                className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center"
                title="Mais ações"
              >
                <span className="material-icons-round">more_vert</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 border border-primary/25 rounded-2xl shadow-2xl z-50 overflow-hidden bg-[#083626]">
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('users');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 text-white"
                    >
                      <span className="material-icons-round text-base text-primary">admin_panel_settings</span>
                      Usuários
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate('lock');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-bold text-red-300 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/10"
                  >
                    <span className="material-icons-round text-base text-red-300">logout</span>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      />

      <main className="px-5 pt-8 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
          <div className="relative w-32 h-32 mx-auto rounded-full border-4 border-primary bg-[#123126] flex items-center justify-center text-3xl font-black text-primary">
            {initials}
            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-background-dark flex items-center justify-center border-2 border-background-dark">
              <span className="material-icons-round text-[20px]">photo_camera</span>
            </button>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight">{currentUser?.name || 'Operador'}</h2>
          <p className="text-white/60 text-xl mt-1">Caderinho de bar</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="text-primary font-bold uppercase text-sm tracking-wide">LOCAL-ONLY ACCOUNT</span>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-white/60 uppercase tracking-[0.2em] text-xs font-black">Segurança</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <span className="material-icons-round">lock</span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Código PIN</p>
                  <p className="text-sm text-white/50">Ativado para transações</p>
                </div>
              </div>
              <button className="h-10 px-4 rounded-full bg-primary/15 border border-primary/30 text-primary text-sm font-black uppercase tracking-wide">
                Alterar
              </button>
            </div>
            <div className="border-t border-white/10 px-4 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <span className="material-icons-round">fingerprint</span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Biometria</p>
                  <p className="text-sm text-white/50">Desbloqueio rápido</p>
                </div>
              </div>
              <button
                onClick={() => setBiometricEnabled(previous => !previous)}
                className={`relative w-14 h-8 rounded-full transition-colors ${biometricEnabled ? 'bg-primary' : 'bg-white/20'}`}
                aria-label="Alternar biometria"
              >
                <span
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${biometricEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-white/60 uppercase tracking-[0.2em] text-xs font-black">Dados Offline</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center">
                  <span className="material-icons-round">upload_file</span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Exportar dados</p>
                  <p className="text-sm text-white/50">Gerar arquivo local de backup</p>
                </div>
              </div>
              <span className="material-icons-round text-white/40">chevron_right</span>
            </button>
            <div className="border-t border-white/10" />
            <button className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <span className="material-icons-round">download</span>
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">Importar dados</p>
                  <p className="text-sm text-white/50">Restaurar backup local</p>
                </div>
              </div>
              <span className="material-icons-round text-white/40">chevron_right</span>
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-white/60 uppercase tracking-[0.2em] text-xs font-black">Conta</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
            <button
              onClick={() => navigate('home')}
              className="w-full px-4 py-4 flex items-center justify-between text-left"
            >
              <div>
                <p className="font-bold text-lg">Ir para Início</p>
                <p className="text-sm text-white/50">Voltar para operação</p>
              </div>
              <span className="material-icons-round text-white/50">chevron_right</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => navigate('users')}
                className="w-full px-4 py-4 flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-bold text-lg">Usuários</p>
                  <p className="text-sm text-white/50">Gerenciar equipe</p>
                </div>
                <span className="material-icons-round text-white/50">chevron_right</span>
              </button>
            )}
          </div>
        </section>

        <button
          onClick={() => navigate('lock')}
          className="w-full h-14 rounded-2xl bg-red-500/30 border-2 border-[#180407] text-[#2a070b] font-black text-base shadow-[0_8px_24px_rgba(35,5,9,0.45)]"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

export default Profile;
