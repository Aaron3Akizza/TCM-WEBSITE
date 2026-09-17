import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Heart, Zap, Target } from 'lucide-react';

export const GetInvolved: React.FC = () => {
  const opportunities = [
    {
      icon: Users,
      title: 'JOIN',
      subtitle: 'Be Part of the Movement',
      description: 'Experience community, encounter God, and grow with other young people who want transformation.',
    },
    {
      icon: Heart,
      title: 'SERVE',
      subtitle: 'Use Your Gifts',
      description: 'Volunteer and use your talents in worship, teaching, leadership, and community service.',
    },
    {
      icon: Zap,
      title: 'LEAD',
      subtitle: 'Develop Your Leadership',
      description: 'Join our leadership development program and become equipped to lead in your sphere of influence.',
    },
    {
      icon: Target,
      title: 'PARTNER',
      subtitle: 'Support the Vision',
      description: 'Partner with us in prayer, giving, or collaboration to expand our impact in the community.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="py-12 bg-tym-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <SectionHeading
              title="Get Involved"
              subtitle="There's a place for you in the TCM community."
              centered={true}
            />
          </div>
        </div>

        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {opportunities.map((opp, index) => {
                const Icon = opp.icon;
                return (
                  <Card key={index} className="flex flex-col">
                    <Icon className="w-12 h-12 text-tym-crimson mb-4" />
                    <h3 className="text-2xl font-bold text-tym-slate mb-2">
                      {opp.title}
                    </h3>
                    <p className="text-sm text-tym-crimson font-semibold mb-3">
                      {opp.subtitle}
                    </p>
                    <p className="text-gray-600 mb-6 flex-grow">
                      {opp.description}
                    </p>
                    <Button variant="outline" size="md">
                      LEARN MORE →
                    </Button>
                  </Card>
                );
              })}
            </div>

            <div className="bg-tym-slate text-white rounded-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Join the Movement?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Whatever your level of involvement, we'd love to have you as part of our community. Start your journey today!
              </p>
              <Button variant="primary" size="lg">
                GET STARTED →
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
