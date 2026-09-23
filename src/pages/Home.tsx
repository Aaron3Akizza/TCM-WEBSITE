import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar }        from '../components/layout/Navbar';
import { Footer }        from '../components/layout/Footer';
import { Hero }          from '../components/home/Hero';
import { IdentityStrip } from '../components/home/IdentityStrip';
import { AboutSection }  from '../components/home/AboutSection';
import { VisionSection } from '../components/home/VisionSection';
import { EventsPreview } from '../components/home/EventsPreview';
import { MovementCTA }   from '../components/home/MovementCTA';
import { Newsletter }    from '../components/home/Newsletter';
import { PlayCircle, ArrowRight, Heart } from 'lucide-react';

export const Home: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      <Hero />
      <IdentityStrip />
      <AboutSection />
      <VisionSection />
      <EventsPreview />

      {/* YouTube / Media teaser */}
      <section className="section-pad bg-white" aria-label="Media">
        <div className="container-tcm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-tag mb-4 block">Watch &amp; Listen</span>
              <h2 className="text-4xl md:text-5xl font-black text-tcm-navy tracking-tight leading-tight mb-5">
                TCM on <span className="text-red-500">YouTube</span>
              </h2>
              <p className="text-tcm-gray-dark text-lg leading-relaxed mb-8">
                Watch sermons, worship sessions, teaching and ministry testimonies on our official YouTube channel.
                Subscribe to stay up to date with everything happening at Transform Christian Ministries.
              </p>
              <a
                href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
                target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-flex text-base px-8 py-4"
              >
                <PlayCircle className="w-5 h-5" /> Watch on YouTube
              </a>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-tcm-navy group">
              <img src="/assets/gallery/tcm-group.jpg" alt="TCM on YouTube" className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300" loading="lazy" />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Visit TCM YouTube channel"
                  className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl hover:bg-red-600 hover:scale-110 transition-all duration-200"
                >
                  <PlayCircle className="w-10 h-10 text-white fill-white" />
                </a>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur">
                  @transformclub-o4f
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="section-pad bg-tcm-gray-soft" aria-label="Gallery preview">
        <div className="container-tcm text-center">
          <span className="label-tag justify-center mb-4 block">Gallery</span>
          <h2 className="text-4xl font-black text-tcm-navy tracking-tight mb-6">Ministry in Action</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[
              { src: '/assets/gallery/tcm-group.jpg',          alt: 'TCM group photo'       },
              { src: '/assets/ministry/ministry-activity.jpg', alt: 'Ministry activity'     },
              { src: '/assets/gallery/ministry-collage.jpg',   alt: 'Ministry collage'      },
            ].map(({ src, alt }) => (
              <div key={src} className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                <img src={src} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
          <Link to="/gallery" className="btn-outline-navy inline-flex">
            View Full Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Support teaser */}
      <section className="py-14 bg-navy-gradient relative overflow-hidden" aria-label="Support the ministry">
        <div className="absolute inset-0 dot-grid" />
        <div className="container-tcm text-center relative z-10">
          <Heart className="w-10 h-10 text-tcm-gold mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white tracking-tight mb-3">Support the Ministry</h2>
          <p className="text-white/55 text-base max-w-xl mx-auto mb-7">
            Your generosity enables us to reach more young people, run ministry events, and serve our communities.
          </p>
          <Link to="/support" className="btn-gold inline-flex">
            Give &amp; Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <MovementCTA />
      <Newsletter />
    </main>
    <Footer />
  </div>
);
