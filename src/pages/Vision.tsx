import React from 'react';
import { Navbar }        from '../components/layout/Navbar';
import { Footer }        from '../components/layout/Footer';
import { VisionSection } from '../components/home/VisionSection';

const steps = [
  { step: '01', title: 'Encounter', body: 'We create spaces — through worship, prayer, retreats and gatherings — where young people genuinely meet God and grow in intimate relationship with Him.'    },
  { step: '02', title: 'Transform', body: 'We invest in discipleship, mentoring and teaching that shapes character, renews the mind, and equips hearts to live as transformed followers of Christ.'       },
  { step: '03', title: 'Send Out',  body: 'We release transformed leaders back into their families, schools, workplaces and communities — empowered to make a lasting Kingdom impact for God\'s glory.' },
];

export const Vision: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <header className="page-banner">
      <div className="page-banner-inner h-56 md:h-80">
        <div className="page-banner-content">
          <div>
            <span className="label-tag-light mb-3 block">Our Direction</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Vision &amp; Mission</h1>
          </div>
        </div>
      </div>
    </header>
    <main className="flex-grow">
      <VisionSection />
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="label-tag justify-center mb-4 block">The Journey</span>
            <h2 className="text-3xl md:text-4xl font-black text-tcm-navy tracking-tight">How We Get There</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {steps.map(({ step, title, body }) => (
              <div key={step} className="card p-8 relative overflow-hidden">
                <span className="absolute top-4 right-5 text-6xl font-black text-tcm-navy/4 leading-none select-none">{step}</span>
                <div className="w-10 h-10 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center mb-5">
                  <span className="text-tcm-gold font-black text-sm">{step}</span>
                </div>
                <h3 className="font-black text-tcm-navy text-xl mb-3">{title}</h3>
                <p className="text-tcm-gray-mid text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);
