import React from 'react';

interface Props {
  label?:    string;
  title:     string;
  subtitle?: string;
  centered?: boolean;
  light?:    boolean;
}

export const SectionHeading: React.FC<Props> = ({ label, title, subtitle, centered = true, light = false }) => (
  <div className={centered ? 'text-center' : 'text-left'}>
    {label && (
      <span className={[
        centered ? 'justify-center' : '',
        light ? 'label-tag-light' : 'label-tag',
        'mb-4 block',
      ].join(' ')}>
        {label}
      </span>
    )}
    <h2 className={['text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4', light ? 'text-white' : 'text-tcm-navy'].join(' ')}>
      {title}
    </h2>
    {subtitle && (
      <p className={['text-lg font-medium mt-2', light ? 'text-white/60' : 'text-tcm-gray-mid'].join(' ')}>
        {subtitle}
      </p>
    )}
    <div className={['divider-gold mt-5', centered ? 'mx-auto' : ''].join(' ')} />
  </div>
);
