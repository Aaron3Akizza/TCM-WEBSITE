import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  Heart, Smartphone, Building2, Copy, CheckCircle2, Info,
  Send, Loader2, AlertTriangle, ChevronRight,
  Music, Radio, Users, Baby, Globe, BookOpen,
  Megaphone, Target, Cpu, Settings, HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isValidEmail } from '../lib/utils';

// ── Ministry departments (easy to extend) ────────────────────
export const DEPARTMENTS = [
  { value: 'choir_music',          label: 'Choir / Music Ministry',           icon: Music      },
  { value: 'media_communications', label: 'Media & Communications',            icon: Radio      },
  { value: 'youth_ministry',       label: 'Youth Ministry',                    icon: Users      },
  { value: 'childrens_ministry',   label: "Children's Ministry",               icon: Baby       },
  { value: 'evangelism_outreach',  label: 'Evangelism / Outreach',             icon: Globe      },
  { value: 'prayer_ministry',      label: 'Prayer Ministry',                   icon: Heart      },
  { value: 'discipleship',         label: 'Discipleship / Bible Teaching',     icon: BookOpen   },
  { value: 'missions',             label: 'Missions',                          icon: Target     },
  { value: 'leadership_dev',       label: 'Leadership & Ministry Development', icon: Megaphone  },
  { value: 'technical_it',         label: 'Technical / IT',                    icon: Cpu        },
  { value: 'general_operations',   label: 'General Ministry Operations',       icon: Settings   },
  { value: 'other',                label: 'Other',                             icon: HelpCircle },
] as const;

// ── Merchandise items (easy to extend / mark unavailable) ────
export const MERCH_ITEMS = [
  { value: 'tshirt',     label: 'T-Shirt',         hasSize: true,  available: true  },
  { value: 'hoodie',     label: 'Hoodie',           hasSize: true,  available: true  },
  { value: 'cap',        label: 'Cap',              hasSize: false, available: true  },
  { value: 'wristband',  label: 'Wristband',        hasSize: false, available: true  },
  { value: 'bag',        label: 'Bag',              hasSize: false, available: true  },
  { value: 'other_merch',label: 'Other Merchandise', hasSize: false, available: true  },
] as const;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

type SupportType = 'ministry_department' | 'merchandise' | 'general' | 'other';

// ── Reusable helpers ─────────────────────────────────────────
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

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-tcm-navy">
      {label}{required && <span className="text-tcm-orange ml-1">*</span>}
      {hint && <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>}
    </label>
    {children}
  </div>
);

// ── Support type card selector ────────────────────────────────
const TypeCard: React.FC<{
  value:    SupportType;
  label:    string;
  desc:     string;
  icon:     React.ElementType;
  selected: boolean;
  onClick:  () => void;
}> = ({ value: _value, label, desc, icon: Icon, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex items-center gap-4 p-4 rounded-2xl border-2 text-left w-full transition-all duration-200',
      selected
        ? 'border-tcm-gold bg-tcm-gold/8 shadow-gold'
        : 'border-gray-200 bg-white hover:border-tcm-gold/50 hover:bg-tcm-gold/4',
    ].join(' ')}
  >
    <div className={[
      'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
      selected ? 'bg-tcm-gold/20 border border-tcm-gold/40' : 'bg-tcm-gray-soft border border-gray-200',
    ].join(' ')}>
      <Icon className={`w-5 h-5 ${selected ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-black text-sm ${selected ? 'text-tcm-navy' : 'text-tcm-gray-dark'}`}>{label}</p>
      <p className="text-tcm-gray-mid text-xs leading-relaxed mt-0.5">{desc}</p>
    </div>
    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${selected ? 'text-tcm-gold' : 'text-gray-300'}`} />
  </button>
);

// ═══════════════════════════════════════════════════════════════
//  Main Support page
// ═══════════════════════════════════════════════════════════════
export const Support: React.FC = () => {
  // ── Form state ──
  const [supportType,   setSupportType]   = useState<SupportType | ''>('');
  const [department,    setDepartment]    = useState('');
  const [merchItem,     setMerchItem]     = useState('');
  const [merchSize,     setMerchSize]     = useState('');
  const [merchQty,      setMerchQty]      = useState(1);
  const [name,          setName]          = useState('');
  const [email,         setEmail]         = useState('');
  const [phone,         setPhone]         = useState('');
  const [amount,        setAmount]        = useState('');
  const [otherDetails,  setOtherDetails]  = useState('');
  const [message,       setMessage]       = useState('');

  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const selectedMerch = MERCH_ITEMS.find(m => m.value === merchItem);

  // ── Validate ──
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim())          e.name        = 'Your name is required.';
    if (!isValidEmail(email))  e.email       = 'A valid email address is required.';
    if (!supportType)          e.supportType = 'Please select a support type.';
    if (supportType === 'ministry_department' && !department)
                               e.department  = 'Please select a ministry department.';
    if (supportType === 'merchandise' && !merchItem)
                               e.merchItem   = 'Please select a merchandise item.';
    if (supportType === 'other' && !otherDetails.trim())
                               e.otherDetails= 'Please describe what you would like to support.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const { error: dbErr } = await supabase.from('support_requests').insert([{
        name:           name.trim(),
        email:          email.trim().toLowerCase(),
        phone:          phone.trim()        || null,
        support_type:   supportType,
        department:     supportType === 'ministry_department' ? department    : null,
        merch_item:     supportType === 'merchandise'         ? merchItem     : null,
        merch_size:     (supportType === 'merchandise' && selectedMerch?.hasSize && merchSize)
                          ? merchSize : null,
        merch_quantity: supportType === 'merchandise'         ? merchQty      : null,
        amount:         amount.trim()       || null,
        other_details:  supportType === 'other'               ? otherDetails  : null,
        message:        message.trim()      || null,
        status:         'new',
      }]);

      if (dbErr) throw dbErr;
      setSuccess(true);
    } catch (err: any) {
      setError('Something went wrong. Please try again or contact us directly.');
      console.error('[Support]', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSupportType(''); setDepartment(''); setMerchItem(''); setMerchSize('');
    setMerchQty(1); setName(''); setEmail(''); setPhone(''); setAmount('');
    setOtherDetails(''); setMessage(''); setSuccess(false); setError('');
    setErrors({});
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="page-banner">
        <div className="page-banner-inner h-56 md:h-72">
          <div className="page-banner-content">
            <div>
              <span className="label-tag-light mb-3 block">Give &amp; Support</span>
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

          {/* Payment details */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            <div className="card p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-tcm-gold" />
                </div>
                <div>
                  <h3 className="font-black text-tcm-navy text-base">Mobile Money</h3>
                  <p className="text-tcm-gray-mid text-xs">MTN Uganda</p>
                </div>
              </div>
              <DetailRow label="Number"  value="0779 340 046" copyable />
              <DetailRow label="Network" value="MTN Uganda" />
              <DetailRow label="Name"    value="(Ministry contact)" />
            </div>

            <div className="card p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-tcm-gold" />
                </div>
                <div>
                  <h3 className="font-black text-tcm-navy text-base">Mobile Money</h3>
                  <p className="text-tcm-gray-mid text-xs">Airtel Uganda</p>
                </div>
              </div>
              <DetailRow label="Number"  value="0704 812 493" copyable />
              <DetailRow label="Network" value="Airtel Uganda" />
              <DetailRow label="Name"    value="(Ministry contact)" />
            </div>

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
                  <DetailRow label="Account Name" value="(Personal account — temporary)" />
                  <DetailRow label="Branch"        value="Uganda" />
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              SUPPORT INTEREST FORM
          ══════════════════════════════════════════════ */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
              <div className="p-8 md:p-10">

                {success ? (
                  /* ── Success state ── */
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-tcm-navy tracking-tight mb-3">
                      Thank You!
                    </h3>
                    <p className="text-tcm-gray-dark text-base leading-relaxed mb-2 max-w-md mx-auto">
                      Your support interest has been received. A member of the TCM team will be in touch with you soon.
                    </p>
                    <p className="text-tcm-gray-mid text-sm mb-8">
                      God bless you for your generosity.
                    </p>
                    <button onClick={reset} className="btn-outline-navy px-8 py-3">
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <h2 className="text-2xl font-black text-tcm-navy mb-1">Express Your Support</h2>
                    <p className="text-tcm-gray-mid text-sm mb-8">
                      Tell us how you'd like to support TCM and we'll get back to you.
                    </p>

                    {/* ── Step 1: Support type ── */}
                    <div className="mb-8">
                      <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-4">
                        Step 1 — What would you like to support?
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TypeCard
                          value="ministry_department"
                          label="Ministry Department"
                          desc="Support a specific area of ministry"
                          icon={Heart}
                          selected={supportType === 'ministry_department'}
                          onClick={() => { setSupportType('ministry_department'); setErrors(v => ({ ...v, supportType: '' })); }}
                        />
                        <TypeCard
                          value="merchandise"
                          label="TCM Merchandise"
                          desc="T-shirts, hoodies, caps and more"
                          icon={ShoppingBag}
                          selected={supportType === 'merchandise'}
                          onClick={() => { setSupportType('merchandise'); setErrors(v => ({ ...v, supportType: '' })); }}
                        />
                        <TypeCard
                          value="general"
                          label="General Ministry Support"
                          desc="Support the overall ministry work"
                          icon={Globe}
                          selected={supportType === 'general'}
                          onClick={() => { setSupportType('general'); setErrors(v => ({ ...v, supportType: '' })); }}
                        />
                        <TypeCard
                          value="other"
                          label="Other"
                          desc="Something else you'd like to support"
                          icon={HelpCircle}
                          selected={supportType === 'other'}
                          onClick={() => { setSupportType('other'); setErrors(v => ({ ...v, supportType: '' })); }}
                        />
                      </div>
                      {errors.supportType && (
                        <p className="text-red-500 text-xs font-medium mt-2">⚠ {errors.supportType}</p>
                      )}
                    </div>

                    {/* ── Ministry department selection ── */}
                    {supportType === 'ministry_department' && (
                      <div className="mb-8">
                        <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-4">
                          Step 2 — Select a Department
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {DEPARTMENTS.map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => { setDepartment(value); setErrors(v => ({ ...v, department: '' })); }}
                              className={[
                                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150',
                                department === value
                                  ? 'border-tcm-gold bg-tcm-gold/8 text-tcm-navy'
                                  : 'border-gray-200 bg-white hover:border-tcm-gold/40 text-tcm-gray-dark',
                              ].join(' ')}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${department === value ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />
                              <span className="text-sm font-semibold">{label}</span>
                              {department === value && <CheckCircle2 className="w-4 h-4 text-tcm-gold ml-auto flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                        {errors.department && (
                          <p className="text-red-500 text-xs font-medium mt-2">⚠ {errors.department}</p>
                        )}
                      </div>
                    )}

                    {/* ── Merchandise selection ── */}
                    {supportType === 'merchandise' && (
                      <div className="mb-8 space-y-5">
                        <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">
                          Step 2 — Select Merchandise
                        </p>

                        {/* Item selection */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {MERCH_ITEMS.map(({ value, label, available }) => (
                            <button
                              key={value}
                              type="button"
                              disabled={!available}
                              onClick={() => { setMerchItem(value); setMerchSize(''); setErrors(v => ({ ...v, merchItem: '' })); }}
                              className={[
                                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150',
                                !available
                                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : merchItem === value
                                  ? 'border-tcm-gold bg-tcm-gold/8'
                                  : 'border-gray-200 bg-white hover:border-tcm-gold/40',
                              ].join(' ')}
                            >
                              <ShoppingBag className={`w-6 h-6 ${merchItem === value ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />
                              <span className={`text-xs font-bold text-center ${merchItem === value ? 'text-tcm-navy' : 'text-tcm-gray-dark'}`}>
                                {label}
                              </span>
                              {!available && <span className="text-[10px] text-tcm-gray-mid">Unavailable</span>}
                            </button>
                          ))}
                        </div>
                        {errors.merchItem && (
                          <p className="text-red-500 text-xs font-medium">⚠ {errors.merchItem}</p>
                        )}

                        {/* Size (if applicable) */}
                        {selectedMerch?.hasSize && (
                          <Field label="Size">
                            <div className="flex flex-wrap gap-2">
                              {SIZES.map(size => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setMerchSize(size)}
                                  className={[
                                    'w-12 h-12 rounded-xl border-2 text-sm font-black transition-all',
                                    merchSize === size
                                      ? 'border-tcm-gold bg-tcm-gold text-tcm-navy shadow-gold'
                                      : 'border-gray-200 text-tcm-gray-dark hover:border-tcm-gold/50',
                                  ].join(' ')}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </Field>
                        )}

                        {/* Quantity */}
                        <Field label="Quantity">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setMerchQty(q => Math.max(1, q - 1))}
                              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-tcm-navy hover:border-tcm-gold transition-colors text-lg"
                            >−</button>
                            <span className="w-10 text-center font-black text-tcm-navy text-lg">{merchQty}</span>
                            <button
                              type="button"
                              onClick={() => setMerchQty(q => Math.min(20, q + 1))}
                              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-tcm-navy hover:border-tcm-gold transition-colors text-lg"
                            >+</button>
                          </div>
                        </Field>
                      </div>
                    )}

                    {/* ── Other: free-text ── */}
                    {supportType === 'other' && (
                      <div className="mb-8">
                        <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-4">
                          Step 2 — Describe Your Support
                        </p>
                        <Field label="What would you like to support?" required>
                          <textarea
                            value={otherDetails}
                            onChange={e => { setOtherDetails(e.target.value); setErrors(v => ({ ...v, otherDetails: '' })); }}
                            placeholder="Please describe what you'd like to support…"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors"
                          />
                        </Field>
                        {errors.otherDetails && (
                          <p className="text-red-500 text-xs font-medium mt-1">⚠ {errors.otherDetails}</p>
                        )}
                      </div>
                    )}

                    {/* ── Contact + details (always shown once type is selected) ── */}
                    {supportType && (
                      <div className="space-y-5">
                        <div className="h-px bg-gray-100" />
                        <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">
                          {supportType === 'ministry_department' || supportType === 'merchandise'
                            ? 'Step 3 — Your Details'
                            : 'Step 2 — Your Details'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Your Name" required>
                            <input
                              value={name}
                              onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })); }}
                              placeholder="Full name"
                              className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                              autoComplete="name"
                            />
                            {errors.name && <p className="text-red-500 text-xs font-medium mt-0.5">⚠ {errors.name}</p>}
                          </Field>
                          <Field label="Email Address" required>
                            <input
                              type="email"
                              value={email}
                              onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })); }}
                              placeholder="your@email.com"
                              className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                              autoComplete="email"
                            />
                            {errors.email && <p className="text-red-500 text-xs font-medium mt-0.5">⚠ {errors.email}</p>}
                          </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Phone / WhatsApp" hint="optional">
                            <input
                              type="tel"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              placeholder="+256 700 000 000"
                              className="input-field"
                              autoComplete="tel"
                            />
                          </Field>
                          <Field label="Amount" hint="optional">
                            <input
                              value={amount}
                              onChange={e => setAmount(e.target.value)}
                              placeholder="e.g. 50,000 UGX or 20 USD"
                              className="input-field"
                            />
                          </Field>
                        </div>

                        <Field label="Additional Message" hint="optional">
                          <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Any additional notes or questions…"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors"
                          />
                        </Field>

                        {error && (
                          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                          </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 justify-center">
                          {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                            : <><Send className="w-4 h-4" /> Submit Support Interest</>
                          }
                        </button>

                        <p className="text-tcm-gray-mid text-xs text-center leading-relaxed">
                          Submitting this form does not complete a payment. A team member will contact you with next steps.
                        </p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Scripture */}
          <div className="max-w-3xl mx-auto mt-10 bg-navy-gradient rounded-2xl p-8 text-center relative overflow-hidden">
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
};
