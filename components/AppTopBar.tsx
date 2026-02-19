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
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-start">
          {onBack && (
            <button onClick={onBack} className="text-primary active:scale-90 transition-transform">
              <span className="material-icons-round text-3xl">chevron_left</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <AppLogo className="w-8 h-8" />
          <h1 className="text-lg font-extrabold tracking-tight">{title}</h1>
        </div>
        <div className="w-10 h-10 flex items-center justify-end">{rightSlot}</div>
      </div>
      {children}
    </header>
  );
};

export default AppTopBar;
