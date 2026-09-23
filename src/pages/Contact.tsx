import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Phone, MapPin, Send, CheckCircle2, Loader2, PlayCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    lines: [
      { text: '+256 779 340 046', href: 'tel:+256779340046' },
      { text: '+256 704 812 493', href: 'tel:+256704812493' },
    ],
  },
  {
    icon: PlayCircle,
    label: 'YouTube',
    lines: [{ text: '@transformclub-o4f', href: 'https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC' }],
  },
  {
    icon: MapPin,
    label: 'Location',
    lines: [{ text: 'Uganda', href: undefined }],
  },
];

export const Contact: React.FC = () => {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(v => ({ ...v, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error: err } = await supabase.from('contact_messages').insert([form]);
      if (err) throw err;
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="page-banner">
        <div className="page-banner-inner h-56 md:h-72">
          <div className="page-banner-content">
            <div>
              <span className="label-tag-light mb-3 block">Reach Out</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Contact Us</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Info */}
            <aside className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-black text-tcm-navy mb-2">Get in Touch</h2>
                <p className="text-tcm-gray-mid text-sm leading-relaxed">
                  We'd love to hear from you. Reach out with questions, partnership inquiries, or to find out more about TCM.
                </p>
              </div>

              {contactInfo.map(({ icon: Icon, label, lines }) => (
                <div key={label} className="card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-tcm-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-[0.15em] mb-1">{label}</p>
                    {lines.map(({ text, href }) => (
                      href
                        ? <a key={text} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                            className="block text-sm font-semibold text-tcm-navy hover:text-tcm-orange transition-colors">
                            {text}
                          </a>
                        : <p key={text} className="text-sm font-semibold text-tcm-navy">{text}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* WhatsApp quick link */}
              <a
                href="https://wa.me/256779340046"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            </aside>

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
              <div className="p-8 md:p-10">
                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-tcm-navy">Message Sent!</h3>
                    <p className="text-tcm-gray-mid max-w-xs">
                      Thanks for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <button onClick={() => setSuccess(false)}
                      className="btn-outline-navy px-6 py-2.5 text-sm mt-2">
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <h2 className="text-xl font-black text-tcm-navy mb-6">Send Us a Message</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Full Name <span className="text-tcm-orange">*</span></label>
                        <input value={form.name} onChange={update('name')} placeholder="Your name" required disabled={loading} className="input-field" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Email <span className="text-tcm-orange">*</span></label>
                        <input type="email" value={form.email} onChange={update('email')} placeholder="your@email.com" required disabled={loading} className="input-field" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Phone <span className="text-tcm-gray-mid text-xs font-normal">(optional)</span></label>
                        <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+256 700 000 000" disabled={loading} className="input-field" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-tcm-navy">Subject <span className="text-tcm-orange">*</span></label>
                        <input value={form.subject} onChange={update('subject')} placeholder="What's this about?" required disabled={loading} className="input-field" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-tcm-navy">Message <span className="text-tcm-orange">*</span></label>
                      <textarea rows={5} value={form.message} onChange={update('message')} placeholder="Tell us how we can help…"
                        required disabled={loading}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors disabled:opacity-50" />
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-red-600 text-sm font-medium">⚠ {error}</p>
                      </div>
                    )}
                    <button type="submit" disabled={loading}
                      className="btn-primary w-full md:w-auto px-8 py-3.5 justify-center">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <><Send className="w-4 h-4" /> Send Message</>
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
