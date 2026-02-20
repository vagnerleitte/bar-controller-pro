import React, { useEffect, useState } from 'react';
import { AppState, User } from '../types';
import AppLogo from './AppLogo';
import { getStoredThemeMode, ThemeMode } from '../services/theme';

interface MainTopBarProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;
  currentUser: User | null;
  onOpenComandas?: () => void;
  onForceSeedSync?: () => Promise<void>;
}

const MainTopBar: React.FC<MainTopBarProps> = ({
  navigate,
  privacyMode,
  setPrivacyMode,
  currentUser,
  onOpenComandas,
  onForceSeedSync
}) => {
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [syncingSeed, setSyncingSeed] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('default');

  useEffect(() => {
    setThemeMode(getStoredThemeMode());
    const observer = new MutationObserver(() => {
      setThemeMode(getStoredThemeMode());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const isDaylight = themeMode === 'daylight';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl safe-area-top ${isDaylight ? 'bg-[#ecfff4]/92' : 'bg-[#022e22]/85'}`}>
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AppLogo className="w-11 h-11 border-2 border-primary rounded-full p-1 bg-[#063c2a]" />
            <span className="absolute -bottom-2 -right-1 bg-primary text-[#022114] text-[10px] font-black px-2 py-0.5 rounded-full leading-none">TOP</span>
          </div>
          <div>
            <h1 className="text-[17px] leading-none font-black tracking-tight">Caderinho de bar</h1>
            <p className="text-primary text-xl font-semibold mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/70"></span>
              Operante
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              title={privacyMode ? 'Mostrar valores' : 'Ocultar valores'}
              aria-label={privacyMode ? 'Mostrar valores' : 'Ocultar valores'}
            >
              <span className="material-icons-round text-xl">{privacyMode ? 'visibility' : 'visibility_off'}</span>
            </button>
            <button
              onClick={() => (onOpenComandas ? onOpenComandas() : navigate('home'))}
              className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              title="Comandas"
              aria-label="Abrir comandas"
            >
              <span className="material-icons-round text-xl">receipt_long</span>
            </button>
            <button
              onClick={() => setTopMenuOpen(prev => !prev)}
              className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
              title="Mais ações"
            >
              <span className="material-icons-round text-2xl">more_vert</span>
            </button>
          </div>
          {topMenuOpen && (
            <div className={`absolute right-0 mt-2 w-56 border border-primary/25 rounded-2xl shadow-2xl z-50 overflow-hidden ${isDaylight ? 'bg-[#f5fff9]' : 'bg-[#083626]'}`}>
              <button
                onClick={() => {
                  navigate('profile');
                  setTopMenuOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 ${isDaylight ? 'text-[#062b17]' : 'text-white'}`}
              >
                <span className="material-icons-round text-base text-primary">person</span>
                Perfil
              </button>
              {onForceSeedSync && (
                <button
                  onClick={async () => {
                    setTopMenuOpen(false);
                    setSyncingSeed(true);
                    try {
                      await onForceSeedSync();
                    } finally {
                      setSyncingSeed(false);
                    }
                  }}
                  disabled={syncingSeed}
                  className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 disabled:opacity-50 ${isDaylight ? 'text-[#062b17]' : 'text-white'}`}
                >
                  <span className="material-icons-round text-base text-primary">{syncingSeed ? 'sync' : 'sync_alt'}</span>
                  {syncingSeed ? 'Sincronizando seed...' : 'Forçar sync seed'}
                </button>
              )}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    navigate('users');
                    setTopMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-primary/10 flex items-center gap-2 ${isDaylight ? 'text-[#062b17]' : 'text-white'}`}
                >
                  <span className="material-icons-round text-base text-primary">admin_panel_settings</span>
                  Gerenciar usuários
                </button>
              )}
              <button
                onClick={() => {
                  setTopMenuOpen(false);
                  navigate('lock');
                }}
                className="w-full px-4 py-3 text-left text-sm font-bold text-red-300 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/10"
              >
                <span className="material-icons-round text-base text-red-300">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainTopBar;
