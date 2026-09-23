import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Users, Heart, Zap, Target, ArrowRight } from 'lucide-react';

const opps = [
  { icon: Users,  num: '01', title: 'JOIN',    sub: 'Be Part of the Movement',   desc: 'Experience community, encounter God, and grow with other young people who want transformation.', cta: { label: 'Join Now',        path: '/membership' } },
  { icon: Heart,  num: '02', title: 'SERVE',   sub: 'Use Your Gifts',            desc: 'Volunteer and use your talents in worship, teaching, leadership, and community service.',        cta: { label: 'Start Serving',   path: '/contact'    } },
  { icon: Zap,    num: '03', title: 'LEAD',    sub: 'Develop Your Leadership',   desc: 'Join our leadership development program and become equipped to lead in your sphere of influence.', cta: { label: 'Develop & Lead',  path: '/contact'    } },
  { icon: Target, num: '04', title: 'PARTNER', sub: 'Support the Vision',        desc: 'Partner with us in prayer, giving, or collaboration to expand our impact in the community.',      cta: { label: 'Become a Partner',path: '/support'    } },
];

export const GetInvolved: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <header className="page-banner">
      <div className="page-banner-inner h-56 md:h-80">
        <div className="page-banner-content">
          <div>
            <span className="label-tag-light mb-3 block">Take Action</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Get Involved</h1>
            <p className="text-white/55 mt-2 text-lg">There's a place for you in the TCM community.</p>
          </div>
        </div>
      </div>
    </header>
    <main className="flex-grow">
      <section className="py-20 bg-tcm-gray-soft">
        <div className="container-tcm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {opps.map(({ icon: Icon, num, title, sub, desc, cta }) => (
              <div key={num} className="group card p-8 relative overflow-hidden hover:border hover:border-tcm-gold/30">
                <span className="absolute top-6 right-7 text-7xl font-black text-tcm-navy/4 leading-none select-none">{num}</span>
                <div className="flex items-start gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-tcm-gold transition-colors duration-300">
                    <Icon className="w-6 h-6 text-tcm-gold group-hover:text-tcm-navy transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-tcm-navy tracking-tight">{title}</h3>
                    <p className="text-tcm-orange text-sm font-bold uppercase tracking-widest">{sub}</p>
                  </div>
                </div>
                <p className="text-tcm-gray-mid leading-relaxed mb-6 text-sm">{desc}</p>
                <Link to={cta.path} className="btn-outline-navy inline-flex text-sm px-5 py-2.5">
                  {cta.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <span className="label-tag justify-center mb-4 block">Start Today</span>
          <h2 className="text-3xl md:text-5xl font-black text-tcm-navy tracking-tight mb-5">Ready to Join the Movement?</h2>
          <p className="text-tcm-gray-mid text-lg max-w-xl mx-auto mb-8">
            Whatever your level of involvement, we'd love to have you as part of our community.
          </p>
          <Link to="/membership" className="btn-primary inline-flex text-base px-9 py-4">
            <Users className="w-5 h-5" /> Become a Member
          </Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);
