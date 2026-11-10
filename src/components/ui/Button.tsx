import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-extrabold rounded-xl transition-all disabled:pointer-events-none disabled:opacity-50 select-none hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0";

  const variants = {
    primary: "border-2 border-slate-900 bg-indigo-600 text-white shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] dark:border-2 dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    secondary: "border-2 border-slate-900 bg-violet-600 text-white shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] dark:border-2 dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    danger: "border-2 border-slate-900 bg-rose-500 text-white shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] dark:border-2 dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    outline: "border-2 border-slate-900 bg-white/70 backdrop-blur-sm text-slate-900 shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] dark:border-2 dark:border-white dark:bg-white/10 dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    ghost: "text-gray-655 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10 transition-all hover:translate-x-0 hover:translate-y-0"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="w-4 h-4 text-current" />}
      {!isLoading && children}
    </button>
  );
};
