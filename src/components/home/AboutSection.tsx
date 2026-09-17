import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const highlights = [
  'Young people passionate about Jesus',
  'Transforming leaders in every sphere',
  'Rooted in authentic community',
  'Kingdom impact in schools & communities',
];

export const AboutSection: React.FC = () => {
  return (
    <section className="section-padding bg-tym-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Image column ── */}
          <div className="relative order-2 lg:order-1">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src="/images/ministry-activity.jpg"
                alt="TCM youth in ministry"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/50 to-transparent" />
            </div>

            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-4 md:right-6 bg-white rounded-2xl shadow-xl px-6 py-5 border border-gray-100 z-10">
              <p className="text-4xl font-black text-tym-slate leading-none">500<span className="text-tym-crimson">+</span></p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Lives Transformed</p>
            </div>

            {/* Decorative box */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-tym-crimson/10 rounded-2xl -z-10" />
          </div>

          {/* ── Text column ── */}
          <div className="order-1 lg:order-2">
            <span className="label-tag mb-6 block">About TCM</span>

            <h2 className="text-4xl md:text-5xl font-black text-tym-slate tracking-tight leading-tight mb-6">
              We Are{' '}
              <span className="relative">
                Transform
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-tym-crimson rounded-full" />
              </span>{' '}
              Christian Ministry
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              TCM is a community of young people passionate about Jesus and
              committed to becoming transformed leaders who influence every
              sphere of life. We believe the next generation has a critical
              role in God's redemptive purpose for the world.
            </p>

            {/* Highlights */}
            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tym-crimson flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm font-medium text-tym-slate">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/about">
              <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                More About Us
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};
