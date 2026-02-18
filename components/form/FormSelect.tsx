import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const FormSelect: React.FC<FormSelectProps> = ({ children, className = '', ...props }) => {
  return (
    <select
      className={`w-full bg-white/5 border border-white/10 rounded-xl py-[14px] px-4 text-sm text-white outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-[#13ec6d55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#13ec6d99] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default FormSelect;
