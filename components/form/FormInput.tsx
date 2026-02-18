import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-white/5 border border-white/10 rounded-xl py-[14px] px-4 text-sm text-white placeholder:text-white/50 outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-[#13ec6d55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#13ec6d99] ${className}`}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
