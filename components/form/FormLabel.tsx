import React from 'react';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const FormLabel: React.FC<FormLabelProps> = ({ children, className = '', ...props }) => {
  return (
    <label
      className={`text-[10px] text-white/60 uppercase font-semibold tracking-widest block ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default FormLabel;
