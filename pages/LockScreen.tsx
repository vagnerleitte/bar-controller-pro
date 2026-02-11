
import React, { useState } from 'react';

interface LockScreenProps {
  onAuthSuccess: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onAuthSuccess }) => {
  const [pin, setPin] = useState('');
  const maxPin = 4;

  const handleKeyPress = (num: string) => {
    if (pin.length < maxPin) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === maxPin) {
        // Simple mock auth
        setTimeout(onAuthSuccess, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
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
            <span className="material-icons-round text-primary text-3xl">lock</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-2">Digite seu PIN</h1>
          <p className="text-white/50 text-sm">Acesso restrito ao gestor do bar</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl w-full rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="flex justify-center gap-4 mb-12">
            {[...Array(maxPin)].map((_, i) => (
              <div 
                key={i}
                className={`w-4 h-4 rounded-full border border-white/20 transition-all duration-200 ${
                  i < pin.length ? 'bg-primary shadow-[0_0_10px_rgba(19,236,109,0.5)] border-primary' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="flex items-center justify-center h-16 w-16 mx-auto rounded-full text-white text-2xl font-medium active:bg-primary/20 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button 
              onClick={() => setPin('')}
              className="flex items-center justify-center h-16 w-16 mx-auto rounded-full text-white/30 text-[10px] font-bold tracking-widest uppercase"
            >
              LIMPAR
            </button>
            <button 
              onClick={() => handleKeyPress('0')}
              className="flex items-center justify-center h-16 w-16 mx-auto rounded-full text-white text-2xl font-medium active:bg-primary/20 active:scale-95 transition-all"
            >
              0
            </button>
            <button 
              onClick={handleBackspace}
              className="flex items-center justify-center h-16 w-16 mx-auto rounded-full text-white/70 active:text-white transition-all"
            >
              <span className="material-icons-round">backspace</span>
            </button>
          </div>

          <button 
            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
          >
            ENTRAR
            <span className="material-icons-round text-sm">arrow_forward</span>
          </button>
          
          <button className="w-full mt-6 text-white/30 text-xs font-medium text-center hover:text-white/60 transition-colors uppercase tracking-widest">
            Esqueceu o PIN?
          </button>
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
