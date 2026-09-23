import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PlayCircle, BookOpen, Music, Clapperboard, ExternalLink } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  sermon:   { icon: BookOpen,     color: 'text-blue-600',   bg: 'bg-blue-50'   },
  worship:  { icon: Music,        color: 'text-purple-600', bg: 'bg-purple-50' },
  teaching: { icon: BookOpen,     color: 'text-tcm-orange', bg: 'bg-orange-50' },
  video:    { icon: Clapperboard, color: 'text-green-600',  bg: 'bg-green-50'  },
};

const staticMedia = [
  { title: 'The Power of Transformation',  type: 'sermon',   desc: 'A powerful message about God\'s transformative power in our lives.' },
  { title: 'Worship Service Highlights',   type: 'worship',  desc: 'Beautiful moments of worship from our community gatherings.'         },
  { title: 'Leadership Development',       type: 'teaching', desc: 'Practical teaching on biblical leadership and servant-hood.'         },
  { title: 'Youth Ministry Stories',       type: 'video',    desc: 'Stories of transformation and growth from TCM members.'             },
];

export const Media: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />

    {/* Banner */}
    <header className="page-banner">
      <div className="page-banner-inner h-56 md:h-72">
        <div className="page-banner-content">
          <div>
            <span className="label-tag-light mb-3 block">Content Hub</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Media &amp; Resources</h1>
            <p className="text-white/50 mt-2 text-base">Sermons, worship, teaching and stories from our community.</p>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-grow bg-tcm-gray-soft">

      {/* YouTube featured */}
      <section className="bg-navy-gradient py-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="container-tcm relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-tag-light mb-4 block">Official Channel</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
                Watch TCM on <span className="text-red-400">YouTube</span>
              </h2>
              <p className="text-white/55 text-lg leading-relaxed mb-8">
                Subscribe to our official YouTube channel for sermons, worship sessions, teaching,
                testimonies and ministry updates. New content added regularly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-red-600 text-white font-black text-sm hover:bg-red-700 transition-colors shadow-lg"
                >
                  <PlayCircle className="w-5 h-5" /> Visit Our Channel
                </a>
                <a
                  href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/30 text-white font-bold text-sm hover:border-white/60 hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> @transformclub-o4f
                </a>
              </div>
            </div>
            {/* Thumbnail */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video group">
              <img src="/assets/gallery/tcm-group.jpg" alt="TCM YouTube" className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300" loading="lazy" />
              <div className="absolute inset-0 flex items-center justify-center">
                <a href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC" target="_blank" rel="noopener noreferrer"
                  aria-label="Visit TCM YouTube channel"
                  className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl hover:bg-red-600 hover:scale-110 transition-all duration-200">
                  <PlayCircle className="w-10 h-10 text-white fill-white" />
                </a>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur">
                  youtube.com/@transformclub-o4f
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry collage */}
      <section className="py-12 bg-tcm-navy">
        <div className="container-tcm">
          <span className="label-tag-light mb-4 block">In The Field</span>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="/assets/gallery/ministry-collage.jpg" alt="Transform Christian Ministries in action"
              className="w-full object-cover" style={{ maxHeight: '520px', objectPosition: 'center top' }} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-tcm-navy/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-white text-2xl md:text-4xl font-black tracking-tight mb-2">TCM in Action</h3>
              <p className="text-white/55 text-sm md:text-base max-w-xl">Gathering, worshipping, leading — one generation at a time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Static media cards */}
      <section className="py-16">
        <div className="container-tcm">
          <div className="text-center mb-10">
            <span className="label-tag justify-center mb-4 block">Resources</span>
            <h2 className="text-3xl font-black text-tcm-navy tracking-tight">Sermons &amp; Teachings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {staticMedia.map((item, i) => {
              const cfg  = typeConfig[item.type] ?? typeConfig.video;
              const Icon = cfg.icon;
              return (
                <div key={i} className="card overflow-hidden group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-tcm-gray-soft to-white relative flex items-center justify-center overflow-hidden">
                    <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle className="w-7 h-7 text-tcm-orange fill-tcm-orange" />
                    </div>
                  </div>
                  <div className="p-5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{item.type}
                    </span>
                    <h3 className="font-bold text-tcm-navy text-sm mb-1.5 leading-snug group-hover:text-tcm-orange transition-colors duration-200">{item.title}</h3>
                    <p className="text-tcm-gray-mid text-xs leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </div>
);
