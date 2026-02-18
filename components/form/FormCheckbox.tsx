import React from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, className = '', id, ...props }) => {
  const generatedId = React.useId();
  const inputId = id || `checkbox_${generatedId}`;
  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-2 text-sm text-white/90 cursor-pointer ${className}`}>
      <input
        id={inputId}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span className="w-5 h-5 rounded-md border border-primary/50 bg-primary/10 flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-[#13ec6d55] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[#13ec6d99] peer-disabled:opacity-50">
        <svg
          viewBox="0 0 20 20"
          className="w-3.5 h-3.5 text-[#0E3B2E] opacity-0 transition-opacity peer-checked:opacity-100"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 10.5L8.5 14L15 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
};

export default FormCheckbox;
