import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Users, BookOpen, Star, Music, Heart, UserCheck, Mic2, Sprout } from 'lucide-react';

const activities = [
  { icon: Users,     num: '01', title: 'Youth Fellowship',        desc: 'Regular gatherings where young people connect, worship and grow together in community.' },
  { icon: BookOpen,  num: '02', title: 'Discipleship Circles',    desc: 'Small-group discipleship focused on spiritual growth, accountability and depth of faith.' },
  { icon: Star,      num: '03', title: 'Leadership Development',  desc: 'Structured programs to identify, equip and release the next generation of leaders.' },
  { icon: Music,     num: '04', title: 'Worship & Prayer Events', desc: "Encounter-driven worship nights and prayer gatherings that usher in God's presence." },
  { icon: Heart,     num: '05', title: 'Community Outreach',      desc: 'Serving our communities with compassion through practical acts of love and justice.' },
  { icon: UserCheck, num: '06', title: 'Mentorship',              desc: 'Intentional one-on-one and group mentoring pairing young people with seasoned leaders.' },
  { icon: Mic2,      num: '07', title: 'Teaching & Preaching',    desc: 'Solid, Spirit-filled teaching grounded in the Word of God and relevant to real life.' },
  { icon: Sprout,    num: '08', title: 'Spiritual Formation',     desc: 'Cultivating spiritual disciplines — fasting, scripture, solitude — that shape Christlike character.' },
];

export const WhatWeDo: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="relative pt-[68px]">
        <div className="relative h-64 md:h-80 bg-tym-slate overflow-hidden">
          <img src="/images/ministry-collage.jpg" alt="Ministry in action"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-tym-slate/90 to-tym-slate/50" />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Ministry Areas</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">What We Do</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Activities */}
        <section className="py-20 bg-tym-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <span className="label-tag justify-center mb-4 block">Our Activities</span>
              <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight">
                How We Serve & Equip
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map(({ icon: Icon, num, title, desc }) => (
                <div key={num}
                  className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-tym-crimson/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <span className="absolute top-4 right-5 text-5xl font-black text-tym-slate/4 leading-none select-none">{num}</span>
                  <div className="w-11 h-11 rounded-xl bg-tym-bg flex items-center justify-center mb-5 group-hover:bg-tym-crimson transition-colors duration-300">
                    <Icon className="w-5 h-5 text-tym-crimson group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-tym-slate mb-2 text-sm uppercase tracking-wide">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Approach Banner */}
        <section className="py-20 bg-tym-slate relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
            <span className="label-tag [&::before]:bg-white text-white justify-center mb-5 block">Our Approach</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8">
              Everything We Do Flows from{' '}
              <span className="text-tym-crimson">Encounter</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We don't run programs for the sake of activity. Every gathering,
              every circle, every outreach is designed to create space for a
              genuine encounter with God that produces lasting transformation.
            </p>
            <Link to="/get-involved">
              <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                Get Involved
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
