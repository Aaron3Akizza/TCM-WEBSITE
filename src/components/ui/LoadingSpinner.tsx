import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

const sizeMap = { sm: 'h-6 w-6 border-2', md: 'h-10 w-10 border-[3px]', lg: 'h-16 w-16 border-4' };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size  = 'md',
  light = false,
}) => (
  <div className="flex items-center justify-center py-16">
    <div
      className={[
        'animate-spin rounded-full',
        sizeMap[size],
        light ? 'border-white/20 border-t-white' : 'border-gray-200 border-t-tym-crimson',
      ].join(' ')}
      role="status"
      aria-label="Loading"
    />
  </div>
);
