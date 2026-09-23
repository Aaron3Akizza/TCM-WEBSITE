import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const photos = [
  { src: '/assets/logo/tcm-logo.jpg',             alt: 'Transform Christian Ministries official banner', caption: 'Our Official Ministry Banner' },
  { src: '/assets/gallery/tcm-group.jpg',          alt: 'TCM youth group',                               caption: 'TCM Community — Growing Together' },
  { src: '/assets/ministry/hero-group.jpg',        alt: 'TCM hero group photo',                          caption: 'Ministry Gathering' },
  { src: '/assets/ministry/ministry-activity.jpg', alt: 'TCM ministry activity',                         caption: 'Ministry in Action' },
  { src: '/assets/ministry/leader-portrait.jpg',   alt: 'TCM ministry leader',                           caption: 'Leadership' },
  { src: '/assets/gallery/ministry-collage.jpg',   alt: 'TCM ministry collage',                          caption: 'Moments from the Field' },
];

export const Gallery: React.FC = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const open  = (i: number) => setLightbox(i);
  const close = () => setLightbox(null);
  const prev  = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  const next  = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null);

  // Keyboard navigation
  React.useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="page-banner">
        <div className="page-banner-inner h-56 md:h-72">
          <div className="page-banner-content">
            <div>
              <span className="label-tag-light mb-3 block">Our Journey</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Gallery</h1>
              <p className="text-white/55 mt-2 text-lg">Ministry moments captured in photos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-14">

          <div className="text-center mb-10">
            <span className="label-tag justify-center mb-4 block">Photo Gallery</span>
            <h2 className="text-3xl font-black text-tcm-navy tracking-tight mb-3">Transform Christian Ministries in Action</h2>
            <p className="text-tcm-gray-mid max-w-xl mx-auto text-sm leading-relaxed">
              A collection of moments from our ministry gatherings, events, and community activities.
              More photos will be added as our journey continues.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-tcm-gold"
                aria-label={`View: ${photo.caption}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-tcm-navy/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-bold">{photo.caption}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Coming soon note */}
          <div className="mt-12 text-center bg-white rounded-2xl border border-tcm-gold/20 p-8">
            <div className="w-12 h-12 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center mx-auto mb-4">
              <ZoomIn className="w-6 h-6 text-tcm-gold" />
            </div>
            <h3 className="font-black text-tcm-navy mb-2">More Photos Coming Soon</h3>
            <p className="text-tcm-gray-mid text-sm max-w-md mx-auto">
              We will continue adding photos from our events, gatherings and ministry activities.
              Follow us on YouTube to see more of what God is doing through TCM.
            </p>
            <a
              href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
              target="_blank" rel="noopener noreferrer"
              className="btn-primary inline-flex mt-5 text-sm"
            >
              Watch on YouTube →
            </a>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-label="Photo lightbox"
          onClick={close}
        >
          {/* Close */}
          <button onClick={close} aria-label="Close lightbox"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10">
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Prev */}
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} className="max-w-4xl w-full mx-16">
            <img
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-center text-white/70 text-sm mt-4 font-semibold">{photos[lightbox].caption}</p>
            <p className="text-center text-white/30 text-xs mt-1">{lightbox + 1} / {photos.length}</p>
          </div>

          {/* Next */}
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};
