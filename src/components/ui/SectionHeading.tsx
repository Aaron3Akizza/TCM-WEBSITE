import React from 'react';

interface SectionHeadingProps {
  label?:    string;
  title:     string;
  subtitle?: string;
  centered?: boolean;
  light?:    boolean;  /* for use on dark backgrounds */
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  label,
  title,
  subtitle,
  centered = true,
  light    = false,
}) => {
  return (
    <div className={centered ? 'text-center' : 'text-left'}>
      {label && (
        <span
          className={[
            'label-tag mb-4',
            centered ? 'justify-center' : '',
            light ? '[&::before]:bg-white text-white' : '',
          ].join(' ')}
        >
          {label}
        </span>
      )}

      <h2
        className={[
          'text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4',
          light ? 'text-white' : 'text-tym-slate',
        ].join(' ')}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={[
            'text-lg font-medium mt-2',
            light ? 'text-gray-300' : 'text-gray-500',
          ].join(' ')}
        >
          {subtitle}
        </p>
      )}

      <div
        className={[
          'divider-crimson mt-5',
          centered ? 'mx-auto' : '',
        ].join(' ')}
      />
    </div>
  );
};
