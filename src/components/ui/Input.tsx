import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  iconLeft?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-tym-slate"
          >
            {label}
            {props.required && (
              <span className="text-tym-crimson ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {iconLeft && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full px-4 py-3 rounded-xl text-sm font-dm-sans text-tym-slate placeholder-gray-400',
              'border-2 bg-white transition-colors duration-200',
              'focus:outline-none focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              iconLeft ? 'pl-10' : '',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-200 focus:border-tym-crimson',
              className,
            ].join(' ')}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
