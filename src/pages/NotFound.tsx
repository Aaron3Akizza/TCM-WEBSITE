import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tym-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Giant 404 */}
          <div className="relative mb-8 select-none">
            <span
              className="font-black text-transparent leading-none"
              style={{
                fontSize: 'clamp(6rem, 20vw, 10rem)',
                WebkitTextStroke: '2px #e5e7eb',
              }}
            >
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-tym-crimson flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-sm">TCM</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-tym-slate tracking-tight mb-3">Page Not Found</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Looks like this page took a detour. Let's get you back on the right path.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};
