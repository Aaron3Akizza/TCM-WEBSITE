import React from 'react';

interface Props { size?: 'sm'|'md'|'lg'; light?: boolean; }
const sizes = { sm: 'h-6 w-6 border-2', md: 'h-10 w-10 border-[3px]', lg: 'h-16 w-16 border-4' };

export const LoadingSpinner: React.FC<Props> = ({ size = 'md', light = false }) => (
  <div className="flex items-center justify-center py-16">
    <div
      className={[
        'animate-spin rounded-full',
        sizes[size],
        light ? 'border-white/20 border-t-white' : 'border-gray-200 border-t-tcm-gold',
      ].join(' ')}
      role="status" aria-label="Loading"
    />
  </div>
);
