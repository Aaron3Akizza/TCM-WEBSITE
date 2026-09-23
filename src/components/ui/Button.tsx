import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'gold' | 'secondary' | 'outline' | 'outline-light' | 'ghost';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  iconLeft?:  React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:       'bg-tcm-orange text-white hover:bg-tcm-orange-lt shadow-orange active:scale-[0.98] focus-visible:ring-tcm-orange',
  gold:          'bg-tcm-gold text-tcm-navy hover:bg-tcm-gold-lt shadow-gold active:scale-[0.98] focus-visible:ring-tcm-gold',
  secondary:     'bg-tcm-navy text-white hover:bg-tcm-navy-lt active:scale-[0.98] focus-visible:ring-tcm-navy',
  outline:       'border-2 border-tcm-navy text-tcm-navy hover:bg-tcm-navy hover:text-white active:scale-[0.98] focus-visible:ring-tcm-navy',
  'outline-light':'border-2 border-white text-white hover:bg-white hover:text-tcm-navy active:scale-[0.98] focus-visible:ring-white',
  ghost:         'text-tcm-orange hover:bg-tcm-orange/8 active:scale-[0.98] focus-visible:ring-tcm-orange',
};

const sizes: Record<Size, string> = {
  sm:  'px-4 py-2 text-xs gap-1.5',
  md:  'px-6 py-2.5 text-sm gap-2',
  lg:  'px-8 py-3.5 text-sm gap-2',
  xl:  'px-10 py-4 text-base gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, iconLeft, iconRight, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center font-bold tracking-wide rounded-full',
        'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
        variants[variant], sizes[size], className,
      ].join(' ')}
      {...props}
    >
      {isLoading
        ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Loading…</span></>
        : <>{iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}{children}{iconRight && <span className="flex-shrink-0">{iconRight}</span>}</>
      }
    </button>
  )
);
Button.displayName = 'Button';
