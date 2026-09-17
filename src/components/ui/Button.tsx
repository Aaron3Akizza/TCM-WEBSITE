import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'outline-light';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  iconLeft?:  React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:       'bg-tym-crimson text-white hover:bg-red-700 focus-visible:ring-tym-crimson shadow-lg shadow-red-200 hover:shadow-red-300 active:scale-[0.98]',
  secondary:     'bg-tym-slate text-white hover:bg-slate-700 focus-visible:ring-tym-slate shadow-lg shadow-slate-200 active:scale-[0.98]',
  outline:       'border-2 border-tym-slate text-tym-slate hover:bg-tym-slate hover:text-white focus-visible:ring-tym-slate active:scale-[0.98]',
  'outline-light':'border-2 border-white text-white hover:bg-white hover:text-tym-slate focus-visible:ring-white active:scale-[0.98]',
  ghost:         'text-tym-crimson hover:bg-red-50 focus-visible:ring-tym-crimson active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm:  'px-4 py-2 text-xs gap-1.5',
  md:  'px-6 py-2.5 text-sm gap-2',
  lg:  'px-8 py-3.5 text-sm gap-2',
  xl:  'px-10 py-4 text-base gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant    = 'primary',
      size       = 'md',
      isLoading  = false,
      iconLeft,
      iconRight,
      children,
      className  = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          'inline-flex items-center justify-center font-bold tracking-wide rounded-full',
          'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading…</span>
          </>
        ) : (
          <>
            {iconLeft  && <span className="flex-shrink-0">{iconLeft}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
