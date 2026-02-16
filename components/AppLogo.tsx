import React from 'react';

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-8 h-8' }) => {
  return <img src="/app-logo.svg" alt="Bar Controller Pro" className={`${className} rounded-lg`} />;
};

export default AppLogo;
