import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Users } from 'lucide-react';
// SignUp now simply redirects to the full Membership page
export const SignUp: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
          <div className="p-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/40 shadow-gold mx-auto mb-6">
              <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black text-tcm-navy tracking-tight mb-3">Join TCM</h1>
            <p className="text-tcm-gray-mid text-base mb-8 leading-relaxed">
              Register as a member of Transform Christian Ministries and become part of our growing community.
            </p>
            <Link to="/membership" className="btn-primary w-full justify-center py-3.5 text-base inline-flex">
              <Users className="w-5 h-5" /> Complete Membership Registration
            </Link>
            <div className="mt-5 pt-5 border-t border-gray-100 text-sm text-tcm-gray-mid">
              Already a member?{' '}
              <Link to="/sign-in" className="text-tcm-orange font-bold hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
