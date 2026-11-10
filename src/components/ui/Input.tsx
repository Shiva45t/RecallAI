import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-350">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-900 bg-white/60 dark:bg-darkSurface/50 backdrop-blur-sm text-gray-900 dark:text-gray-105 transition-all outline-none shadow-[2px_2px_0px_0px_#0f172a] focus:shadow-[4px_4px_0px_0px_#0f172a] focus:translate-x-[-2px] focus:translate-y-[-2px] placeholder:text-gray-400 dark:placeholder:text-gray-500
            ${error ? 'border-rose-500 focus:border-rose-500' : ''} 
            dark:border-2 dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:focus:translate-x-[-2px] dark:focus:translate-y-[-2px] dark:focus:border-white
            ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-rose-500 font-medium">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-xs text-gray-550 dark:text-gray-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
