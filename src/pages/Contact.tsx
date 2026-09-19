import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Contact: React.FC = () => {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.from('contact_messages').insert([form]);
      if (err) throw err;
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="relative pt-[72px]">
        <div className="relative h-56 md:h-72 bg-tym-slate overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Reach Out</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Contact Us</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tym-bg">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── Contact info ── */}
            <aside className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black text-tym-slate mb-2">Get in Touch</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We'd love to hear from you. Reach out with questions,
                  partnership inquiries, or to learn more about TCM.
                </p>
              </div>

              {[
                { icon: Mail,    label: 'Email',    value: 'info@tcm.org',       href: 'mailto:info@tcm.org' },
                { icon: Phone,   label: 'Phone',    value: '+256 700 000 000',   href: 'tel:+256700000000' },
                { icon: MapPin,  label: 'Location', value: 'Uganda',             href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-tym-crimson/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-tym-crimson" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="font-semibold text-tym-slate hover:text-tym-crimson transition-colors text-sm">{value}</a>
                    ) : (
                      <p className="font-semibold text-tym-slate text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </aside>

            {/* ── Form ── */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">
              {success ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-tym-slate">Message Sent!</h3>
                  <p className="text-gray-500 max-w-sm">
                    Thanks for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <Button variant="ghost" size="md" onClick={() => setSuccess(false)}>
                    Send Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-black text-tym-slate mb-6">Send Us a Message</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Full Name" placeholder="Your name" value={form.name}
                      onChange={update('name')} required disabled={loading} />
                    <Input label="Email" type="email" placeholder="your@email.com" value={form.email}
                      onChange={update('email')} required disabled={loading} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Phone" placeholder="+256 700 000 000" value={form.phone}
                      onChange={update('phone')} disabled={loading} />
                    <Input label="Subject" placeholder="What's this about?" value={form.subject}
                      onChange={update('subject')} required disabled={loading} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-tym-slate">
                      Message <span className="text-tym-crimson">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={update('message')}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tym-slate placeholder-gray-400 text-sm font-dm-sans transition-colors duration-200 focus:outline-none focus:border-tym-crimson disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      ⚠ {error}
                    </p>
                  )}
                  <Button type="submit" variant="primary" size="lg" isLoading={loading}
                    iconRight={<Send className="w-4 h-4" />} className="w-full md:w-auto">
                    Send Message
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
