import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

export const MovementCTA: React.FC = () => {
  return (
    <section className="section-padding bg-tym-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-tym-crimson/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-tym-slate/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10">
        {/* Overline */}
        <span className="label-tag justify-center mb-6 block">Join the Movement</span>

        {/* Heading */}
        <h2
          className="font-black text-tym-slate tracking-tighter leading-none mb-6"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
        >
          Be Part of
          <br />
          <span className="text-tym-crimson">Something Greater</span>
        </h2>

        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Together, let's see a generation awakened, equipped and sent out as
          transformed leaders for the glory of God. Join TCM and step into
          your purpose.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/get-involved">
            <Button variant="primary" size="xl" iconRight={<ArrowRight className="w-5 h-5" />}>
              Join TCM Today
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="xl">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Trust line */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-10">
          500+ members · Growing communities · Kingdom impact
        </p>
      </div>
    </section>
  );
};
