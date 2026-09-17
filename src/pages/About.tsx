import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SectionHeading } from '../components/ui/SectionHeading';

export const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="py-12 bg-tym-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <SectionHeading
              title="About Transform Christian Ministry"
              centered={true}
            />
          </div>
        </div>

        <div className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8">

            {/* Leader Feature */}
            <section className="mb-16">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-shrink-0">
                  <div className="w-56 h-64 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src="/images/leader-portrait.jpg"
                      alt="TCM ministry leader"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-tym-crimson font-semibold text-sm uppercase tracking-wider mb-2">
                    Leadership
                  </p>
                  <h2 className="text-3xl font-bold text-tym-slate mb-4">
                    Rooted in Purpose
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Our leaders walk alongside young people with vision, faith, and
                    dedication — carrying the Transform Christian Ministry badge
                    not just on their chest, but in how they live and serve every
                    day.
                  </p>
                </div>
              </div>
            </section>
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-tym-slate mb-6">
                Who We Are
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Transform Christian Ministry (TCM) is a community of young people
                passionate about Jesus and committed to becoming transformed
                leaders who influence every sphere of life. We believe that the
                next generation has a critical role to play in God's redemptive
                purpose for the world.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded on the conviction that young people can encounter God
                deeply and experience genuine transformation, TCM exists to
                create spaces where this encounter and transformation can happen
                in authentic community.
              </p>
            </section>

            <section className="mb-16">
              <h2 className="text-3xl font-bold text-tym-slate mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To create spaces where young people encounter God deeply,
                experience genuine transformation, develop their gifts and
                calling, and go out to make a kingdom impact in their families,
                schools, workplaces, and communities.
              </p>
            </section>

            <section className="mb-16">
              <h2 className="text-3xl font-bold text-tym-slate mb-6">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Authentic Encounter with God',
                    description:
                      'We believe young people need more than ideas about God; they need genuine encounters with His presence.',
                  },
                  {
                    title: 'Holistic Transformation',
                    description:
                      'Transformation that changes not just what we believe, but who we are and how we live.',
                  },
                  {
                    title: 'Leadership Development',
                    description:
                      'Every young person has potential for leadership. We exist to develop and equip them.',
                  },
                  {
                    title: 'Kingdom Impact',
                    description:
                      'Our calling is to raise a generation that impacts their world for God\'s Kingdom.',
                  },
                ].map((value, index) => (
                  <div key={index}>
                    <h3 className="text-xl font-bold text-tym-slate mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-700 text-tym-slate mb-6">
                Get Connected
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Want to learn more about TCM or get involved? We'd love to
                connect with you.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
