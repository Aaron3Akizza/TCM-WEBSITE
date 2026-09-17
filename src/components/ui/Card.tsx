import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'flat' | 'bordered';
  hover?:   boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default:  'bg-white border border-gray-100 shadow-sm',
  dark:     'bg-tym-slate border border-white/10 text-white',
  flat:     'bg-tym-bg border border-gray-200',
  bordered: 'bg-white border-2 border-gray-200',
};

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hover   = true,
      padding = 'md',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={[
          'rounded-2xl overflow-hidden',
          variantClasses[variant],
          paddingClasses[padding],
          hover
            ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1'
            : '',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
