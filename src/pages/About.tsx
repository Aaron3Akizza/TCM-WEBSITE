import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const values = [
  {
    title: 'Authentic Encounter with God',
    description: 'We believe young people need more than ideas about God — they need genuine encounters with His presence.',
  },
  {
    title: 'Holistic Transformation',
    description: 'Transformation that changes not just what we believe, but who we are and how we live every day.',
  },
  {
    title: 'Leadership Development',
    description: 'Every young person has potential for leadership. We exist to develop and release them.',
  },
  {
    title: 'Kingdom Impact',
    description: "Our calling is to raise a generation that impacts their world for God's Kingdom.",
  },
];

export const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Hero banner ── */}
      <header className="relative pt-[68px] overflow-hidden">
        <div className="relative h-64 md:h-80 bg-tym-slate">
          <img
            src="/images/hero-group.jpg"
            alt="TCM community"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-tym-slate/90 to-tym-slate/50" />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Our Story</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                About TCM
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">

        {/* ── Leader feature ── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[3/4]">
                  <img
                    src="/images/leader-portrait.jpg"
                    alt="TCM ministry leader"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/60 to-transparent" />
                </div>
                <div className="absolute -bottom-5 -right-4 bg-tym-crimson text-white rounded-2xl px-5 py-4 shadow-xl">
                  <p className="font-black text-2xl leading-none">3+</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-200 mt-0.5">Years of Ministry</p>
                </div>
                <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-tym-crimson/30 rounded-2xl -z-10" />
              </div>
              <div>
                <span className="label-tag mb-4 block">Leadership</span>
                <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight mb-5">
                  Rooted in Purpose
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-4">
                  Our leaders walk alongside young people with vision, faith, and
                  dedication — carrying the Transform Christian Ministry badge not
                  just on their chest, but in how they live and serve every day.
                </p>
                <p className="text-gray-500 text-base leading-relaxed">
                  Founded on the conviction that young people can encounter God
                  deeply and experience genuine transformation, TCM exists to
                  create spaces where this encounter can happen in authentic
                  community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who We Are ── */}
        <section className="py-20 bg-tym-bg">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <span className="label-tag mb-4 block">Who We Are</span>
            <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight mb-6">
              Transform Christian Ministry (TCM)
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-5">
              TCM is a community of young people passionate about Jesus and
              committed to becoming transformed leaders who influence every sphere
              of life. We believe the next generation has a critical role to play
              in God's redemptive purpose for the world.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed">
              Founded on the conviction that young people can encounter God deeply
              and experience genuine transformation, TCM exists to create spaces
              where this encounter and transformation can happen in authentic
              community.
            </p>
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="bg-tym-slate rounded-3xl p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-tym-crimson/10 rounded-full blur-3xl pointer-events-none" />
              <span className="label-tag [&::before]:bg-white text-white mb-4 block">Our Mission</span>
              <blockquote className="text-white text-xl md:text-2xl font-semibold leading-relaxed relative z-10"
                          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                "To create spaces where young people encounter God deeply,
                experience genuine transformation, develop their gifts and calling,
                and go out to make a kingdom impact in their families, schools,
                workplaces, and communities."
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="py-20 bg-tym-bg">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <span className="label-tag mb-4 block">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight mb-10">
              What We Stand For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-tym-crimson flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-tym-slate mb-2">{v.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Get Connected ── */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <span className="label-tag justify-center mb-4 block">Get Connected</span>
            <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight mb-5">
              Ready to Be Part of TCM?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
              Want to learn more or get involved? We'd love to connect with you
              and walk this journey together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-involved">
                <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                  Get Involved
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">Contact Us</Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};
