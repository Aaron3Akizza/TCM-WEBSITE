import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const values = [
  { title: 'Authentic Encounter with God',   desc: 'We believe young people need more than ideas about God — they need genuine encounters with His presence.' },
  { title: 'Holistic Transformation',         desc: 'Transformation that changes not just what we believe, but who we are and how we live every day.'         },
  { title: 'Leadership Development',          desc: 'Every young person has potential for leadership. We exist to develop and release them.'                   },
  { title: 'Kingdom Impact',                  desc: "Our calling is to raise a generation that impacts their world for God's Kingdom."                         },
];

export const About: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />

    <header className="page-banner">
      <div className="page-banner-inner h-56 md:h-80">
        <div className="page-banner-content">
          <div>
            <span className="label-tag-light mb-3 block">Our Story</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">About TCM</h1>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-grow">

      {/* Leader feature */}
      <section className="py-20 bg-white">
        <div className="container-tcm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[3/4]">
                <img src="/assets/ministry/leader-portrait.jpg" alt="TCM ministry leader" className="w-full h-full object-cover object-top" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-tcm-navy/60 to-transparent" />
              </div>
              <div className="absolute -bottom-5 -right-3 bg-tcm-orange text-white rounded-2xl px-5 py-4 shadow-orange">
                <p className="font-black text-2xl leading-none">3+<span className="text-xs font-semibold ml-1">yrs</span></p>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-200 mt-0.5">Ministry</p>
              </div>
              <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-tcm-gold/30 rounded-2xl -z-10" />
            </div>
            <div>
              <span className="label-tag mb-4 block">Leadership</span>
              <h2 className="text-3xl md:text-4xl font-black text-tcm-navy tracking-tight mb-5">Rooted in Purpose</h2>
              <p className="text-tcm-gray-dark text-lg leading-relaxed mb-4">
                Our leaders walk alongside young people with vision, faith and dedication — carrying the
                Transform Christian Ministries identity not just on their chest, but in how they live and serve.
              </p>
              <p className="text-tcm-gray-dark text-base leading-relaxed">
                Founded on the conviction that young people can encounter God deeply and experience genuine
                transformation, TCM exists to create spaces where this encounter happens in authentic community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-20 bg-tcm-gray-soft">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <span className="label-tag mb-4 block">Who We Are</span>
          <h2 className="text-3xl md:text-4xl font-black text-tcm-navy tracking-tight mb-6">Transform Christian Ministries</h2>
          <p className="text-tcm-gray-dark text-lg leading-relaxed mb-5">
            TCM is a community of young people passionate about Jesus and committed to becoming transformed
            leaders who influence every sphere of life. We believe the next generation has a critical role
            to play in God's redemptive purpose for the world.
          </p>
          <p className="text-tcm-gray-dark text-lg leading-relaxed">
            Founded on the conviction that young people can encounter God deeply and experience genuine
            transformation, TCM exists to create spaces where this encounter and transformation can happen
            in authentic community — <em className="text-tcm-navy font-semibold">Catch the Fire, Ignite Others.</em>
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-navy-gradient rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 dot-grid" />
            <span className="label-tag-light mb-4 block relative z-10">Our Mission</span>
            <blockquote className="text-white text-xl md:text-2xl font-semibold leading-relaxed relative z-10 italic"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "To create spaces where young people encounter God deeply, experience genuine transformation,
              develop their gifts and calling, and go out to make a kingdom impact in their families,
              schools, workplaces, and communities."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-tcm-gray-soft">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <span className="label-tag mb-4 block">Our Values</span>
          <h2 className="text-3xl md:text-4xl font-black text-tcm-navy tracking-tight mb-10">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <div key={i} className="card p-7 hover:border-tcm-gold/30 hover:border">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-tcm-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-tcm-navy mb-2">{v.title}</h3>
                    <p className="text-tcm-gray-mid text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="label-tag justify-center mb-4 block">Get Connected</span>
          <h2 className="text-3xl md:text-4xl font-black text-tcm-navy tracking-tight mb-5">Ready to Be Part of TCM?</h2>
          <p className="text-tcm-gray-mid text-lg max-w-xl mx-auto mb-8">
            We'd love to connect with you and walk this journey together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership" className="btn-primary inline-flex px-8 py-3.5">Become a Member <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/contact" className="btn-outline-navy inline-flex px-8 py-3.5">Contact Us</Link>
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </div>
);
