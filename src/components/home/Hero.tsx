import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-tym-bg flex items-center">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-tym-slate font-semibold mb-4">
                Igniting The
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-tym-slate leading-tight mb-4">
                NEW CREATION
              </h1>
              <p className="text-2xl md:text-3xl text-tym-slate font-normal mb-4">
                <span className="font-medium">into</span>
              </p>
              <h2 className="text-4xl md:text-6xl font-bold text-tym-crimson mb-8">
                TRANSFORMED LEADERS
              </h2>
            </div>

            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              We are a generation encountering God, transformed by His grace,
              and empowered to transform our world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/get-involved">
                <Button variant="primary" size="lg">
                  GET INVOLVED →
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  LEARN MORE →
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 md:h-full min-h-96">
            <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/images/hero-group.jpg"
                alt="Transform Christian Ministry youth gathering"
                className="w-full h-full object-cover object-center"
              />
              {/* subtle overlay to tie into brand colours */}
              <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
