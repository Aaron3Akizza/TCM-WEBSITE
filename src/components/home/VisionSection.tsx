import React from 'react';
import { Zap, BookOpen, Users, Target } from 'lucide-react';

const pillars = [
  { num: '01', icon: Zap,      title: 'ENCOUNTER', desc: 'Creating spaces for genuine encounters with God through worship, prayer and community.' },
  { num: '02', icon: BookOpen, title: 'TRANSFORM',  desc: 'Discipleship rooted in God\'s Word that changes who we are and how we live.' },
  { num: '03', icon: Users,    title: 'EQUIP',      desc: 'Developing gifts, calling and leadership for every sphere of influence.' },
  { num: '04', icon: Target,   title: 'IMPACT',     desc: 'Going out to transform families, schools, workplaces and communities for God\'s Kingdom.' },
];

export const VisionSection: React.FC = () => (
  <section className="section-pad bg-tcm-gray-soft relative overflow-hidden" aria-label="Our vision">
    <div className="absolute inset-0 dot-grid" />
    <div className="container-tcm relative z-10">

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-16">

        {/* Portrait */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[3/4] max-w-sm mx-auto lg:mx-0">
            <img src="/assets/ministry/leader-portrait.jpg" alt="TCM ministry leader" className="w-full h-full object-cover object-top" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-tcm-navy/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="bg-white/10 backdrop-blur border border-tcm-gold/30 rounded-xl px-4 py-3">
                <p className="text-white font-bold text-sm">Transform Christian Ministries</p>
                <p className="text-tcm-gold text-xs mt-0.5 font-semibold">Catch the Fire · Ignite Others</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-tcm-gold rounded-2xl -z-10" />
          <div className="absolute -top-4 -right-4 w-16 h-16 border-2 border-tcm-gold/30 rounded-2xl -z-10" />
        </div>

        {/* Text */}
        <div>
          <span className="label-tag mb-4 block">Our Vision</span>
          <h2 className="text-4xl md:text-5xl font-black text-tcm-navy tracking-tight leading-tight mb-4">
            Igniting the New Creation into
            <span className="text-tcm-orange"> Transformed Leaders</span>
          </h2>
          <div className="divider-gold mb-6" />
          <p className="text-tcm-gray-dark text-lg leading-relaxed mb-5">
            We believe God is raising up a generation of transformed leaders who will see His Kingdom
            established in every sphere — families, schools, workplaces and communities.
          </p>
          <blockquote className="pl-5 border-l-4 border-tcm-gold mt-6">
            <p className="text-tcm-navy-lt font-semibold italic text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."
            </p>
            <cite className="text-xs text-tcm-gold font-bold uppercase tracking-widest mt-2 block not-italic">
              2 Corinthians 5:17
            </cite>
          </blockquote>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map(({ num, icon: Icon, title, desc }) => (
          <div key={num} className="group card-gold-border p-6 relative overflow-hidden">
            <span className="absolute top-4 right-5 text-5xl font-black text-tcm-navy/5 leading-none select-none">{num}</span>
            <div className="w-11 h-11 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center mb-5 group-hover:bg-tcm-gold group-hover:border-tcm-gold transition-all duration-300">
              <Icon className="w-5 h-5 text-tcm-gold group-hover:text-tcm-navy transition-colors duration-300" strokeWidth={2} />
            </div>
            <h3 className="text-xs font-black text-tcm-navy uppercase tracking-[0.2em] mb-2">{title}</h3>
            <p className="text-tcm-gray-mid text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
);
