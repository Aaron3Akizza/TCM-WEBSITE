import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Zap, Flame, Lightbulb, Target } from 'lucide-react';

const pillars = [
  {
    number: '01',
    icon: Zap,
    title: 'ENCOUNTER',
    description: 'Creating spaces for young people to encounter God and grow in deep intimacy with Him.',
    color: 'from-yellow-500/10 to-orange-500/5',
  },
  {
    number: '02',
    icon: Flame,
    title: 'TRANSFORM',
    description: 'We are transformed by the Word, the Spirit, and the boundless love of Christ.',
    color: 'from-tym-crimson/10 to-red-500/5',
  },
  {
    number: '03',
    icon: Lightbulb,
    title: 'EQUIP',
    description: 'Equipped with truth, skills and purpose to fulfil our God-given calling.',
    color: 'from-blue-500/10 to-indigo-500/5',
  },
  {
    number: '04',
    icon: Target,
    title: 'IMPACT',
    description: 'We go out to impact our world and raise a generation of transformed leaders.',
    color: 'from-green-500/10 to-emerald-500/5',
  },
];

export const VisionSection: React.FC = () => {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-tym-crimson/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-tym-slate/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

        {/* ── Top: image + heading ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">

          {/* Portrait */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/4] max-w-sm mx-auto lg:mx-0">
              <img
                src="/images/leader-portrait.jpg"
                alt="TCM leader"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/70 via-transparent to-transparent" />
              {/* Badge overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                  <p className="text-white font-bold text-sm">Transform Christian Ministry</p>
                  <p className="text-white/60 text-xs mt-0.5">Raising Transformed Leaders</p>
                </div>
              </div>
            </div>

            {/* Crimson accent block */}
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-tym-crimson rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-16 h-16 border-2 border-tym-crimson/30 rounded-2xl -z-10" />
          </div>

          {/* Vision text */}
          <div>
            <SectionHeading
              label="Our Vision"
              title="Igniting the New Creation into Transformed Leaders"
              centered={false}
            />
            <p className="text-gray-500 text-lg leading-relaxed mt-8">
              We believe God is raising up a generation of transformed leaders
              who will see His Kingdom established in every sphere of society —
              in families, schools, workplaces and communities.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed mt-4">
              This is our calling. This is our vision. This is why TCM exists.
            </p>

            {/* Quote accent */}
            <blockquote className="mt-8 pl-5 border-l-4 border-tym-crimson">
              <p className="text-tym-slate font-semibold italic text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                "Do not conform to the pattern of this world, but be transformed
                by the renewing of your mind."
              </p>
              <cite className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-2 block not-italic">
                Romans 12:2
              </cite>
            </blockquote>
          </div>
        </div>

        {/* ── Pillars grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.number}
                className={[
                  'group relative rounded-2xl p-6 border border-gray-100',
                  'bg-gradient-to-br',  pillar.color,
                  'hover:border-tym-crimson/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
                ].join(' ')}
              >
                {/* Number */}
                <span className="absolute top-4 right-5 text-5xl font-black text-tym-slate/5 leading-none select-none">
                  {pillar.number}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:bg-tym-crimson group-hover:shadow-md transition-all duration-300">
                  <Icon className="w-5 h-5 text-tym-crimson group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                </div>

                <h3 className="text-xs font-black text-tym-slate uppercase tracking-[0.2em] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
