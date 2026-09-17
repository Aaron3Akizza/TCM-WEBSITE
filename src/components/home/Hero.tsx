import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-tym-slate">

      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-group.jpg"
          alt="TCM youth gathering"
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layer overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-tym-slate/95 via-tym-slate/75 to-tym-slate/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/60 via-transparent to-transparent" />
      </div>

      {/* ── Decorative elements ── */}
      <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-tym-crimson/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-[25%] w-40 h-40 rounded-full bg-tym-crimson/15 blur-2xl pointer-events-none" />

      {/* ── Vertical label ── */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-white/20" />
        <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase"
           style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          Transform · Encounter · Lead
        </p>
        <div className="w-px h-16 bg-white/20" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20 w-full">
        <div className="max-w-3xl">

          {/* Label */}
          <div className="flex items-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <div className="w-8 h-px bg-tym-crimson" />
            <span className="text-tym-crimson text-xs font-bold uppercase tracking-[0.25em]">
              Transform Christian Ministry
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black text-white leading-none tracking-tighter mb-6 animate-fade-up"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', animationDelay: '80ms' }}
          >
            Igniting The
            <br />
            <span className="text-gradient bg-gradient-to-r from-tym-crimson to-red-400 bg-clip-text text-transparent">
              New Creation
            </span>
            <br />
            <span className="font-light italic text-white/80" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.7em' }}>
              into transformed leaders
            </span>
          </h1>

          {/* Body */}
          <p
            className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            A generation encountering God, transformed by His grace, and
            empowered to reshape their world for the Kingdom.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <Link to="/get-involved">
              <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                Get Involved
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline-light" size="lg" iconLeft={<Play className="w-4 h-4 fill-white" />}>
                Our Story
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div
            className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/10 animate-fade-up"
            style={{ animationDelay: '320ms' }}
          >
            {[
              { value: '500+', label: 'Young people reached' },
              { value: '3+',   label: 'Years of ministry' },
              { value: '10+',  label: 'Communities impacted' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-white leading-none">{stat.value}</p>
                <p className="text-white/50 text-xs font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <span className="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
};
