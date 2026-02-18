import React from 'react';

type FormButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FormButtonVariant;
}

const variantClasses: Record<FormButtonVariant, string> = {
  primary: 'bg-primary text-background-dark hover:bg-primary/90',
  secondary: 'bg-white/10 border border-white/20 text-white',
  ghost: 'bg-transparent border border-white/10 text-white/80',
  danger: 'bg-red-500/85 text-white hover:bg-red-500'
};

const FormButton: React.FC<FormButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold py-[14px] px-4 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[#13ec6d55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#13ec6d99] ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export default FormButton;
