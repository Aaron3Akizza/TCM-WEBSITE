import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Play } from 'lucide-react';

export const Hero: React.FC = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden bg-tcm-navy" aria-label="Hero">
    {/* Background image */}
    <div className="absolute inset-0">
      <img
        src="/assets/gallery/tcm-group.jpg"
        alt="Transform Christian Ministries community"
        className="w-full h-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-tcm-navy/80 via-transparent to-transparent" />
    </div>

    {/* Radial glow accents */}
    <div className="absolute top-1/4 right-[8%] w-72 h-72 rounded-full bg-tcm-gold/8 blur-3xl pointer-events-none" />
    <div className="absolute bottom-1/4 right-[20%] w-48 h-48 rounded-full bg-tcm-orange/10 blur-2xl pointer-events-none" />

    {/* Vertical side label */}
    <div className="absolute left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3">
      <div className="w-px h-14 bg-tcm-gold/30" />
      <p className="text-tcm-gold/50 text-[9px] font-bold tracking-[0.3em] uppercase"
         style={{ writingMode: 'vertical-rl' }}>
        2 Corinthians 5:17
      </p>
      <div className="w-px h-14 bg-tcm-gold/30" />
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20 w-full">
      <div className="max-w-2xl">

        {/* Official logo */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center gap-3 bg-white/8 border border-tcm-gold/30 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-tcm-gold/50 flex-shrink-0">
              <img src="/assets/logo/tcm-logo.jpg" alt="TCM Logo" className="w-full h-full object-cover object-center" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-white text-sm tracking-wider uppercase">Transform Christian</span>
              <span className="font-semibold text-tcm-gold text-xs tracking-[0.2em] uppercase">Ministries</span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="w-8 h-px bg-tcm-gold" />
          <span className="text-tcm-gold text-xs font-bold uppercase tracking-[0.25em]">
            Catch the Fire · Ignite Others
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="font-black text-white leading-none tracking-tighter mb-6 animate-fade-up"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', animationDelay: '160ms' }}
        >
          Igniting the
          <br />
          <span className="text-gold-gradient">New Creation</span>
          <br />
          <span className="font-light text-white/70" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.65em' }}>
            into Transformed Leaders
          </span>
        </h1>

        {/* Scripture */}
        <p className="text-white/60 text-sm mb-8 italic animate-fade-up" style={{ animationDelay: '220ms', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}>
          "Therefore, if anyone is in Christ, he is a new creation…" — 2 Cor. 5:17
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Link
            to="/membership"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-tcm-gold text-tcm-navy font-black text-sm uppercase tracking-wider hover:bg-tcm-gold-lt active:scale-[0.98] transition-all duration-200 shadow-gold"
          >
            <Users className="w-4 h-4" />
            Become a Member
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/40 text-white font-bold text-sm hover:border-white hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
          >
            <Play className="w-4 h-4 fill-white" />
            Our Story
          </Link>
          <a
            href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-red-400/50 text-red-300 font-bold text-sm hover:border-red-400 hover:bg-red-400/10 active:scale-[0.98] transition-all duration-200"
          >
            Watch on YouTube
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-white/10 animate-fade-up stagger" style={{ animationDelay: '380ms' }}>
          {[
            { value: '500+', label: 'Young people reached' },
            { value: '3+',   label: 'Years of ministry'    },
            { value: '10+',  label: 'Communities impacted' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white leading-none">{s.value}</p>
              <p className="text-white/45 text-xs font-medium mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <span className="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
      <div className="w-px h-10 bg-gradient-to-b from-tcm-gold/40 to-transparent" />
    </div>
  </section>
);
