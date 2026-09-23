import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8 select-none">
          <span className="font-black text-transparent leading-none"
            style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', WebkitTextStroke: '2px #e5e7eb' }}>
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/50 shadow-gold">
              <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-black text-tcm-navy tracking-tight mb-3">Page Not Found</h1>
        <p className="text-tcm-gray-mid text-base leading-relaxed mb-8">
          Looks like this page took a detour. Let's get you back on the right path.
        </p>
        <Link to="/" className="btn-primary inline-flex px-8 py-3.5">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);
