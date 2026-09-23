import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Heart, Smartphone, Building2, Copy, CheckCircle2, Info } from 'lucide-react';

const categories = [
  'General Ministry Support',
  'Evangelism',
  'Community Outreach',
  'Media & Production',
  'Youth Ministry',
  'Welfare & Welfare',
  'Church Activities',
  'Missions',
  'Other',
];

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} aria-label={`Copy ${text}`}
      className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tcm-gold/10 border border-tcm-gold/30 text-tcm-gold text-[11px] font-bold hover:bg-tcm-gold/20 transition-colors">
      {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
};

const DetailRow: React.FC<{ label: string; value: string; copyable?: boolean }> = ({ label, value, copyable }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-tcm-gray-mid text-sm">{label}</span>
    <div className="flex items-center gap-1">
      <span className="font-bold text-tcm-navy text-sm">{value}</span>
      {copyable && <CopyButton text={value} />}
    </div>
  </div>
);

export const Support: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />

    {/* Banner */}
    <header className="page-banner">
      <div className="page-banner-inner h-56 md:h-72">
        <div className="page-banner-content">
          <div>
            <span className="label-tag-light mb-3 block">Give & Support</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Support the Ministry</h1>
            <p className="text-white/55 mt-2 text-base max-w-xl">
              Your generosity enables us to reach young people, run ministry events and serve our communities.
            </p>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-grow bg-tcm-gray-soft">
      <div className="container-tcm py-14">

        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Heart className="w-12 h-12 text-tcm-gold mx-auto mb-4" />
          <h2 className="text-3xl font-black text-tcm-navy tracking-tight mb-4">Partner with Us</h2>
          <p className="text-tcm-gray-dark text-lg leading-relaxed">
            Every contribution — big or small — makes a real difference in the lives of young people
            and the communities we serve. Thank you for believing in the vision of Transform Christian Ministries.
          </p>
        </div>

        {/* Transparency notice */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="bg-tcm-sky-lt/60 border border-tcm-sky/40 rounded-2xl p-5 flex items-start gap-4">
            <Info className="w-5 h-5 text-tcm-navy-lt flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-tcm-navy text-sm mb-1">Important Notice</p>
              <p className="text-tcm-gray-dark text-sm leading-relaxed">
                Transform Christian Ministries is currently not yet formally registered as an organization.
                The payment details below are personal accounts used temporarily to receive ministry
                contributions. These arrangements will be updated once the ministry is formally registered
                and official ministry accounts are established. Thank you for your understanding and trust.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Mobile Money 1 */}
          <div className="card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-tcm-gold" />
              </div>
              <div>
                <h3 className="font-black text-tcm-navy text-base">Mobile Money</h3>
                <p className="text-tcm-gray-mid text-xs">MTN / Airtel Uganda</p>
              </div>
            </div>
            <DetailRow label="Number" value="0779 340 046" copyable />
            <DetailRow label="Network" value="MTN Uganda" />
            <DetailRow label="Name" value="(Ministry contact)" />
          </div>

          {/* Mobile Money 2 */}
          <div className="card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-tcm-gold" />
              </div>
              <div>
                <h3 className="font-black text-tcm-navy text-base">Mobile Money</h3>
                <p className="text-tcm-gray-mid text-xs">MTN / Airtel Uganda</p>
              </div>
            </div>
            <DetailRow label="Number" value="0704 812 493" copyable />
            <DetailRow label="Network" value="Airtel Uganda" />
            <DetailRow label="Name" value="(Ministry contact)" />
          </div>

          {/* Bank */}
          <div className="card p-7 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-tcm-navy/8 border border-tcm-navy/15 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-tcm-navy" />
              </div>
              <div>
                <h3 className="font-black text-tcm-navy text-base">Bank Transfer</h3>
                <p className="text-tcm-gray-mid text-xs">ABSA Bank Uganda</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <div>
                <DetailRow label="Bank"           value="ABSA Bank Uganda" />
                <DetailRow label="Account Number" value="6007927566" copyable />
              </div>
              <div>
                <DetailRow label="Account Name"   value="(Personal account — temporary)" />
                <DetailRow label="Branch"         value="Uganda" />
              </div>
            </div>
          </div>
        </div>

        {/* Reference guide */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-tcm-gold/20 p-7 mb-10">
          <h3 className="font-black text-tcm-navy mb-2">Payment Reference Guide</h3>
          <p className="text-tcm-gray-dark text-sm leading-relaxed mb-4">
            When making a contribution, please include the purpose of your payment in the transaction
            reference or narration where possible. This helps us identify and allocate your support appropriately.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span key={cat} className="inline-flex items-center px-3 py-1.5 rounded-full bg-tcm-gray-soft border border-tcm-gold/20 text-tcm-navy text-xs font-semibold">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Scripture */}
        <div className="max-w-3xl mx-auto bg-navy-gradient rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-grid" />
          <blockquote className="relative z-10">
            <p className="text-white/75 text-lg leading-relaxed italic mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion,
              for God loves a cheerful giver."
            </p>
            <cite className="text-tcm-gold text-sm font-bold not-italic">— 2 Corinthians 9:7</cite>
          </blockquote>
        </div>

      </div>
    </main>
    <Footer />
  </div>
);
