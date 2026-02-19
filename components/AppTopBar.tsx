import React from 'react';
import AppLogo from './AppLogo';

interface AppTopBarProps {
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const AppTopBar: React.FC<AppTopBarProps> = ({
  title,
  onBack,
  rightSlot,
  children,
  className = 'bg-background-dark/80'
}) => {
  return (
    <header className={`safe-area-top sticky top-0 z-50 backdrop-blur-xl ${className}`}>
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack ? (
            <button onClick={onBack} className="text-primary active:scale-90 transition-transform shrink-0">
              <span className="material-icons-round text-3xl">chevron_left</span>
            </button>
          ) : (
            <div className="w-8 h-8 shrink-0" />
          )}
          <AppLogo className="w-8 h-8 shrink-0" />
          <h1 className="text-lg font-extrabold tracking-tight truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
      </div>
      {children}
    </header>
  );
};

export default AppTopBar;
