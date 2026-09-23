import React from 'react';
import { Flame, BookOpen, Wind } from 'lucide-react';

// Simple cross SVG — not in lucide
const CrossIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

export const IdentityStrip: React.FC = () => (
  <section className="bg-tcm-gray-soft border-y border-tcm-gold/20" aria-label="Ministry identity">
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-tcm-gold/10">
        {[
          { Icon: Wind,      label: 'Holy Spirit',    sub: 'Our Guide'      },
          { Icon: BookOpen,  label: "God's Word",     sub: 'Our Foundation' },
          { Icon: CrossIcon, label: 'Transformation', sub: 'Our Mission'    },
          { Icon: Flame,     label: 'Passion',        sub: 'Our Calling'    },
        ].map(({ Icon, label, sub }, i) => (
          <div key={label} className="group flex flex-col items-center text-center px-6 py-10 hover:bg-white transition-colors duration-200">
            <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-tcm-gold/10 border border-tcm-gold/20 flex items-center justify-center mb-4 transition-colors duration-200 shadow-sm">
              <Icon className="w-5 h-5 text-tcm-gold" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold text-tcm-orange/60 tracking-widest uppercase mb-1">0{i + 1}</span>
            <h3 className="text-xs font-black text-tcm-navy uppercase tracking-widest mb-1">{label}</h3>
            <p className="text-[11px] text-tcm-gray-mid">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
