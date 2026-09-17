import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { Zap, Flame, Lightbulb, Target } from 'lucide-react';

export const VisionSection: React.FC = () => {
  const pillars = [
    {
      number: '01',
      icon: Zap,
      title: 'ENCOUNTER',
      description:
        'Creating spaces for young people to encounter God and grow in intimacy with Him.',
    },
    {
      number: '02',
      icon: Flame,
      title: 'TRANSFORM',
      description:
        'We are transformed by the Word, the Spirit, and the love of Christ.',
    },
    {
      number: '03',
      icon: Lightbulb,
      title: 'EQUIP',
      description:
        'We are equipped with truth, skills, and purpose to fulfil our God-given calling.',
    },
    {
      number: '04',
      icon: Target,
      title: 'IMPACT',
      description:
        'We go out to impact our world and raise a generation of transformed leaders.',
    },
  ];

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Vision Statement */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
          {/* Portrait */}
          <div className="flex-shrink-0 w-full md:w-64">
            <div className="relative rounded-xl overflow-hidden shadow-xl h-80">
              <img
                src="/images/leader-portrait.jpg"
                alt="TCM leader"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-white text-xs font-semibold uppercase tracking-widest bg-tym-crimson px-2 py-1 rounded">
                  Transform Christian Ministry
                </span>
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="flex-grow text-center md:text-left">
            <SectionHeading
              label="OUR VISION"
              title="We Are a Christian Ministry Igniting the New Creation"
              subtitle="Into Transformed Leaders"
              centered={false}
            />
            <p className="text-lg text-gray-600 max-w-2xl mt-6">
              We believe that God has a plan to raise up transformed leaders who
              will see His Kingdom established in every sphere of society. This is
              our calling and our vision.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.number}
                className="p-6 hover:border-tym-crimson transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl font-bold text-gray-200">
                    {pillar.number}
                  </span>
                  <Icon className="w-8 h-8 text-tym-crimson" />
                </div>
                <h3 className="text-xl font-bold text-tym-slate mb-3">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 flex-grow">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
