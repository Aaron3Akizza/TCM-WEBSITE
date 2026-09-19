import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Play, BookOpen, Music, Clapperboard } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  sermon:   { icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  worship:  { icon: Music,    color: 'bg-purple-100 text-purple-600' },
  teaching: { icon: BookOpen, color: 'bg-orange-100 text-orange-600' },
  video:    { icon: Clapperboard, color: 'bg-green-100 text-green-600' },
  photo:    { icon: Play,         color: 'bg-pink-100 text-pink-600' },
};

const staticMedia = [
  { title: 'The Power of Transformation',  type: 'sermon',   description: 'A powerful message about God\'s transformative power in our lives.' },
  { title: 'Worship Service Highlights',   type: 'worship',  description: 'Beautiful moments of worship from our community gatherings.' },
  { title: 'Leadership Development',       type: 'teaching', description: 'Practical teaching on biblical leadership and servant hood.' },
  { title: 'Youth Ministry Stories',       type: 'video',    description: 'Stories of transformation and growth from TCM members.' },
];

export const Media: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="relative pt-[68px]">
        <div className="relative h-64 md:h-80 bg-tym-slate overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Content Hub</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Media & Resources</h1>
              <p className="text-white/50 mt-3 text-lg">Sermons, worship, teaching and stories from our community.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Ministry Collage */}
        <section className="bg-tym-slate py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <span className="label-tag [&::before]:bg-white text-white mb-5 block">In The Field</span>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/ministry-collage.jpg"
                alt="Transform Christian Ministry in action"
                className="w-full object-cover"
                style={{ maxHeight: '540px', objectPosition: 'center top' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tym-slate/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-white text-2xl md:text-4xl font-black tracking-tight mb-2">TCM in Action</h3>
                <p className="text-white/60 text-sm md:text-base max-w-xl">
                  Gathering, worshipping, leading — one generation at a time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Media Grid */}
        <section className="py-20 bg-tym-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <span className="label-tag justify-center mb-4 block">Resources</span>
              <h2 className="text-3xl md:text-4xl font-black text-tym-slate tracking-tight">Sermons & Teaching</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {staticMedia.map((item, i) => {
                const cfg  = typeConfig[item.type] ?? typeConfig.video;
                const Icon = cfg.icon;
                return (
                  <div key={i}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center overflow-hidden">
                      <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-tym-crimson fill-tym-crimson" />
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full mb-3 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {item.type}
                      </span>
                      <h3 className="font-bold text-tym-slate text-sm mb-1.5 leading-snug group-hover:text-tym-crimson transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{item.description}</p>
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
};
