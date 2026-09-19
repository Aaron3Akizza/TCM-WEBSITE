import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Users, Heart, Zap, Target, ArrowRight } from 'lucide-react';

const opportunities = [
  {
    icon: Users,
    num: '01',
    title: 'JOIN',
    subtitle: 'Be Part of the Movement',
    description: 'Experience community, encounter God, and grow with other young people who want transformation.',
    cta: { label: 'Join Now', path: '/sign-up' },
    accent: 'from-blue-500/10 to-indigo-500/5',
  },
  {
    icon: Heart,
    num: '02',
    title: 'SERVE',
    subtitle: 'Use Your Gifts',
    description: 'Volunteer and use your talents in worship, teaching, leadership, and community service.',
    cta: { label: 'Start Serving', path: '/contact' },
    accent: 'from-red-500/10 to-pink-500/5',
  },
  {
    icon: Zap,
    num: '03',
    title: 'LEAD',
    subtitle: 'Develop Your Leadership',
    description: 'Join our leadership development program and become equipped to lead in your sphere of influence.',
    cta: { label: 'Develop Your Leadership', path: '/contact' },
    accent: 'from-yellow-500/10 to-orange-500/5',
  },
  {
    icon: Target,
    num: '04',
    title: 'PARTNER',
    subtitle: 'Support the Vision',
    description: 'Partner with us in prayer, giving, or collaboration to expand our impact in the community.',
    cta: { label: 'Become a Partner', path: '/contact' },
    accent: 'from-green-500/10 to-emerald-500/5',
  },
];

export const GetInvolved: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="relative pt-[68px]">
        <div className="relative h-64 md:h-80 bg-tym-slate overflow-hidden">
          <img src="/images/hero-group.jpg" alt="TCM community"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-tym-slate/90 to-tym-slate/50" />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Take Action</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Get Involved</h1>
              <p className="text-white/60 mt-3 text-lg">There's a place for you in the TCM community.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Opportunities */}
        <section className="py-20 bg-tym-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {opportunities.map(({ icon: Icon, num, title, subtitle, description, cta, accent }) => (
                <div key={num}
                  className={`group relative bg-gradient-to-br ${accent} rounded-3xl p-8 border border-gray-100 hover:border-tym-crimson/20 hover:shadow-xl transition-all duration-300`}>
                  <span className="absolute top-6 right-7 text-7xl font-black text-tym-slate/4 leading-none select-none">{num}</span>
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 group-hover:bg-tym-crimson transition-colors duration-300">
                      <Icon className="w-6 h-6 text-tym-crimson group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-tym-slate tracking-tight">{title}</h3>
                      <p className="text-tym-crimson text-sm font-bold uppercase tracking-widest">{subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 leading-relaxed mb-7">{description}</p>
                  <Link to={cta.path}>
                    <Button variant="outline" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                      {cta.label}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
            <span className="label-tag justify-center mb-4 block">Start Today</span>
            <h2 className="text-3xl md:text-5xl font-black text-tym-slate tracking-tight mb-5">
              Ready to Join the Movement?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
              Whatever your level of involvement, we'd love to have you as part
              of our community. Start your journey today.
            </p>
            <Link to="/sign-up">
              <Button variant="primary" size="xl" iconRight={<ArrowRight className="w-5 h-5" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
