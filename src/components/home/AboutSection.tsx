import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const highlights = [
  'Young people passionate about Jesus Christ',
  'Transformed leaders influencing every sphere of life',
  'Authentic community rooted in God\'s Word',
  'Kingdom impact in schools, homes and communities',
];

export const AboutSection: React.FC = () => (
  <section className="section-pad bg-white overflow-hidden" aria-label="About TCM">
    <div className="container-tcm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Image */}
        <div className="relative order-2 lg:order-1">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
            <img
              src="/assets/ministry/ministry-activity.jpg"
              alt="TCM ministry in action"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tcm-navy/50 to-transparent" />
          </div>
          {/* Stat float card */}
          <div className="absolute -bottom-5 -right-2 md:right-4 bg-white rounded-2xl shadow-navy px-6 py-4 border border-tcm-gold/20 z-10">
            <p className="text-4xl font-black text-tcm-navy leading-none">500<span className="text-tcm-orange">+</span></p>
            <p className="text-xs font-bold text-tcm-gray-mid uppercase tracking-widest mt-1">Lives Transformed</p>
          </div>
          {/* Gold accent box */}
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-tcm-gold/15 rounded-2xl -z-10 border border-tcm-gold/30" />
        </div>

        {/* Text */}
        <div className="order-1 lg:order-2">
          <span className="label-tag mb-4 block">About Us</span>
          <h2 className="text-4xl md:text-5xl font-black text-tcm-navy tracking-tight leading-tight mb-5">
            We Are{' '}
            <span className="relative text-tcm-orange">
              Transform
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-tcm-gold rounded-full" />
            </span>{' '}
            Christian Ministries
          </h2>
          <p className="text-tcm-gray-dark text-lg leading-relaxed mb-6">
            A community of young people passionate about Jesus — committed to becoming transformed leaders
            who influence every sphere of life. We believe the next generation has a critical role in God's
            redemptive purpose for the world.
          </p>
          <ul className="space-y-3 mb-8">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-tcm-gold flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm font-medium text-tcm-gray-dark">{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/about" className="btn-primary inline-flex">
            More About Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  </section>
);
