import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const AboutSection: React.FC = () => {
  return (
    <div className="py-24 bg-tym-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <p className="text-tym-crimson font-semibold text-sm uppercase tracking-wider mb-4">
              ABOUT TCM
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-tym-slate mb-6">
              We Are Transform Christian Ministry
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              TCM is a community of young people passionate about Jesus and
              committed to becoming transformed leaders who influence every
              sphere of life. We believe that the next generation has a critical
              role to play in God's redemptive purpose for the world.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our mission is to create spaces where young people encounter God
              deeply, experience genuine transformation, develop their gifts and
              calling, and go out to make a kingdom impact in their families,
              schools, workplaces, and communities.
            </p>
            <Link to="/about">
              <Button variant="primary" size="lg">
                MORE ABOUT US →
              </Button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <img
              src="/images/ministry-activity.jpg"
              alt="TCM youth in ministry activity"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/50 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};
