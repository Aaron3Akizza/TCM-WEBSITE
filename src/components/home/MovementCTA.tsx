import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';

export const MovementCTA: React.FC = () => (
  <section className="section-pad bg-white relative overflow-hidden" aria-label="Join the movement">
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-tcm-gold/8 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-tcm-orange/6 rounded-full blur-3xl pointer-events-none" />
    <div className="container-tcm text-center relative z-10">
      <span className="label-tag justify-center mb-5 block">Join the Movement</span>
      <h2 className="font-black text-tcm-navy tracking-tighter leading-none mb-5"
          style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}>
        Be Part of<br />
        <span className="text-fire-gradient">Something Greater</span>
      </h2>
      <p className="text-tcm-gray-dark text-lg max-w-2xl mx-auto leading-relaxed mb-10">
        Together, let's see a generation awakened, equipped and sent out as transformed leaders
        for the glory of God. Join Transform Christian Ministries and step into your purpose.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/membership" className="btn-primary inline-flex text-base px-8 py-4">
          <Users className="w-5 h-5" /> Become a Member
        </Link>
        <Link to="/about" className="btn-outline-navy inline-flex text-base px-8 py-4">
          Learn More <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
      <p className="text-tcm-gray-mid text-xs font-semibold uppercase tracking-widest mt-10">
        500+ members · Growing communities · Kingdom impact
      </p>
    </div>
  </section>
);
