import React from 'react';
import { Church, Heart, Compass, Users } from 'lucide-react';

const items = [
  { icon: Church,  title: 'A Sanctuary',  desc: 'A safe space to encounter God deeply' },
  { icon: Heart,   title: 'Redeemed',     desc: 'Set free by the grace of Jesus Christ' },
  { icon: Compass, title: 'Destined',     desc: 'Walking in God-given purpose and calling' },
  { icon: Users,   title: 'A Community',  desc: 'Growing together in authentic community' },
];

export const IdentityStrip: React.FC = () => {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="group flex flex-col items-center text-center px-6 py-10 hover:bg-tym-bg transition-colors duration-200"
            >
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-2xl bg-tym-bg group-hover:bg-tym-crimson/10 flex items-center justify-center mb-4 transition-colors duration-200">
                <Icon className="w-6 h-6 text-tym-crimson" strokeWidth={1.5} />
              </div>

              {/* Number accent */}
              <span className="text-[10px] font-bold text-tym-crimson/40 tracking-widest uppercase mb-1">
                0{i + 1}
              </span>

              <h3 className="text-sm font-black text-tym-slate uppercase tracking-widest mb-2">
                {title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[160px]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
