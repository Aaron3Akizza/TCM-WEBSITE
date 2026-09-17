import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { VisionSection } from '../components/home/VisionSection';

const steps = [
  {
    step: '01',
    title: 'Encounter',
    body: 'We create spaces — through worship, prayer, retreats and gatherings — where young people genuinely meet God and grow in intimate relationship with Him.',
  },
  {
    step: '02',
    title: 'Transform',
    body: 'We invest in discipleship, mentoring and teaching that shapes character, renews the mind, and equips hearts to live as transformed followers of Christ.',
  },
  {
    step: '03',
    title: 'Send Out',
    body: 'We release transformed leaders back into their families, schools, workplaces and communities — empowered to make a lasting Kingdom impact.',
  },
];

export const Vision: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="relative pt-[72px]">
        <div className="relative h-64 md:h-80 bg-tym-slate overflow-hidden">
          <img
            src="/images/ministry-activity.jpg"
            alt="TCM vision"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-tym-slate/90 to-tym-slate/50" />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Our Direction</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Vision & Mission</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <VisionSection />

        {/* How We Get There */}
        <section className="py-20 bg-tym-bg">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <span className="label-tag justify-center mb-4 block">The Journey</span>
              <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight">How We Get There</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map(({ step, title, body }) => (
                <div key={step} className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <span className="absolute top-6 right-6 text-6xl font-black text-tym-slate/5 leading-none select-none">{step}</span>
                  <div className="w-10 h-10 rounded-xl bg-tym-crimson/10 flex items-center justify-center mb-5">
                    <span className="text-tym-crimson font-black text-sm">{step}</span>
                  </div>
                  <h3 className="font-black text-tym-slate text-xl mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
