import React from 'react';

interface FormRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

const FormRadio: React.FC<FormRadioProps> = ({ label, className = '', id, ...props }) => {
  const generatedId = React.useId();
  const inputId = id || `radio_${generatedId}`;
  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-2 text-sm text-white/90 cursor-pointer ${className}`}>
      <input
        id={inputId}
        type="radio"
        className="peer sr-only"
        {...props}
      />
      <span className="w-5 h-5 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-[#13ec6d55] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#13ec6d99] peer-disabled:opacity-50">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0E3B2E] opacity-0 transition-opacity peer-checked:opacity-100"></span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
};

export default FormRadio;
