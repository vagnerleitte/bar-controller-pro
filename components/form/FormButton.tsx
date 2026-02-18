import React from 'react';

type FormButtonTone = 'primary' | 'danger' | 'success' | 'info' | 'neutral';
type FormButtonStyle = 'contained' | 'outlined' | 'link';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: FormButtonTone;
  variant?: FormButtonStyle;
}

const toneClasses: Record<FormButtonTone, { contained: string; outlined: string; link: string }> = {
  primary: {
    contained: 'bg-primary text-background-dark hover:bg-primary/90',
    outlined: 'border border-primary/60 text-primary bg-transparent hover:bg-primary/10',
    link: 'text-primary bg-transparent hover:text-primary/80'
  },
  danger: {
    contained: 'bg-red-500 text-white hover:bg-red-500/90',
    outlined: 'border border-red-400/70 text-red-300 bg-transparent hover:bg-red-500/10',
    link: 'text-red-300 bg-transparent hover:text-red-200'
  },
  success: {
    contained: 'bg-emerald-500 text-background-dark hover:bg-emerald-500/90',
    outlined: 'border border-emerald-400/70 text-emerald-300 bg-transparent hover:bg-emerald-500/10',
    link: 'text-emerald-300 bg-transparent hover:text-emerald-200'
  },
  info: {
    contained: 'bg-sky-500 text-background-dark hover:bg-sky-500/90',
    outlined: 'border border-sky-400/70 text-sky-300 bg-transparent hover:bg-sky-500/10',
    link: 'text-sky-300 bg-transparent hover:text-sky-200'
  },
  neutral: {
    contained: 'bg-white/20 text-white hover:bg-white/25',
    outlined: 'border border-white/25 text-white/90 bg-transparent hover:bg-white/10',
    link: 'text-white/85 bg-transparent hover:text-white'
  }
};

const FormButton: React.FC<FormButtonProps> = ({ tone = 'primary', variant = 'contained', className = '', ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold py-[14px] px-4 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[#13ec6d55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#13ec6d99] ${toneClasses[tone][variant]} ${className}`}
      {...props}
    />
  );
};

export default FormButton;
