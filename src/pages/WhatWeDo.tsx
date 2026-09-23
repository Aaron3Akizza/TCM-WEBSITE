import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowRight, Users, BookOpen, Star, Music, Heart, UserCheck, Mic2, Sprout } from 'lucide-react';

const activities = [
  { icon: Users,     num: '01', title: 'Youth Fellowship',        desc: 'Regular gatherings where young people connect, worship and grow together in community.'                   },
  { icon: BookOpen,  num: '02', title: 'Discipleship Circles',    desc: 'Small-group discipleship focused on spiritual growth, accountability and depth of faith.'                 },
  { icon: Star,      num: '03', title: 'Leadership Development',  desc: 'Structured programs to identify, equip and release the next generation of leaders.'                       },
  { icon: Music,     num: '04', title: 'Worship & Prayer Events', desc: "Encounter-driven worship nights and prayer gatherings that usher in God's presence."                       },
  { icon: Heart,     num: '05', title: 'Community Outreach',      desc: 'Serving our communities with compassion through practical acts of love and justice.'                       },
  { icon: UserCheck, num: '06', title: 'Mentorship',              desc: 'Intentional one-on-one and group mentoring pairing young people with seasoned leaders.'                    },
  { icon: Mic2,      num: '07', title: 'Teaching & Preaching',    desc: 'Solid, Spirit-filled teaching grounded in the Word of God and relevant to real life.'                     },
  { icon: Sprout,    num: '08', title: 'Spiritual Formation',     desc: 'Cultivating spiritual disciplines — fasting, scripture, solitude — that shape Christlike character.'      },
];

export const WhatWeDo: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <header className="page-banner">
      <div className="page-banner-inner h-56 md:h-80">
        <div className="page-banner-content">
          <div>
            <span className="label-tag-light mb-3 block">Ministry Areas</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">What We Do</h1>
          </div>
        </div>
      </div>
    </header>
    <main className="flex-grow">
      <section className="py-20 bg-tcm-gray-soft">
        <div className="container-tcm">
          <div className="text-center mb-14">
            <span className="label-tag justify-center mb-4 block">Our Activities</span>
            <h2 className="text-3xl md:text-4xl font-black text-tcm-navy tracking-tight">How We Serve &amp; Equip</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activities.map(({ icon: Icon, num, title, desc }) => (
              <div key={num} className="group card p-7 relative overflow-hidden hover:border hover:border-tcm-gold/30">
                <span className="absolute top-4 right-5 text-5xl font-black text-tcm-navy/4 leading-none select-none">{num}</span>
                <div className="w-11 h-11 rounded-xl bg-tcm-gray-soft flex items-center justify-center mb-5 group-hover:bg-tcm-gold transition-colors duration-300">
                  <Icon className="w-5 h-5 text-tcm-gold group-hover:text-tcm-navy transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-tcm-navy mb-2 text-sm uppercase tracking-wide">{title}</h3>
                <p className="text-tcm-gray-mid text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-gradient relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="label-tag-light justify-center mb-5 block">Our Approach</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
            Everything We Do Flows from <span className="text-tcm-gold">Encounter</span>
          </h2>
          <p className="text-white/55 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            We don't run programs for the sake of activity. Every gathering, circle, and outreach is designed
            to create space for a genuine encounter with God that produces lasting transformation.
          </p>
          <Link to="/get-involved" className="btn-gold inline-flex px-8 py-3.5">
            Get Involved <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);
