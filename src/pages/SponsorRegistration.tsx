import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar }       from '../components/layout/Navbar';
import { Footer }       from '../components/layout/Footer';
import { PhotoUpload }  from '../components/ui/PhotoUpload';
import { supabase }     from '../lib/supabase';
import { isValidEmail } from '../lib/utils';
import { DEPARTMENTS, MERCH_ITEMS } from './Support';
import {
  Heart, ChevronRight, CheckCircle2, Loader2, AlertTriangle,
  Copy, Smartphone, Building2, ShoppingBag, Globe, HelpCircle,
  User, Mail, Phone, FileText, Calendar, ArrowLeft, ArrowRight,
  Music, Radio, Users, Baby, BookOpen, Megaphone, Target, Cpu,
  Settings, Send,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────
type SponsorType = 'general' | 'department' | 'project' | 'merchandise' | 'other';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

interface PaymentMethod {
  id:             string;
  name:           string;
  provider:       string | null;
  account_number: string | null;
  account_name:   string | null;
  bank_name:      string | null;
  instructions:   string | null;
  display_order:  number;
}

// ── Shared small UI ───────────────────────────────────────────
const Field: React.FC<{
  label: string; required?: boolean; hint?: string;
  error?: string; children: React.ReactNode;
}> = ({ label, required, hint, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-tcm-navy">
      {label}{required && <span className="text-tcm-orange ml-1">*</span>}
      {hint && <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs font-medium">⚠ {error}</p>}
  </div>
);

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => {
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }}
      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tcm-gold/15 border border-tcm-gold/30 text-tcm-gold text-[11px] font-bold hover:bg-tcm-gold/25 transition-colors">
      {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
};

// ── Step indicator ────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Support Type' },
  { n: 2, label: 'Details'      },
  { n: 3, label: 'Send Support' },
  { n: 4, label: 'Registration' },
  { n: 5, label: 'Confirmation' },
];

const StepBar: React.FC<{ current: number }> = ({ current }) => (
  <div className="w-full mb-8">
    {/* Mobile: just label */}
    <p className="text-center text-xs font-bold text-tcm-gray-mid mb-3 sm:hidden">
      Step {current} of {STEPS.length} — {STEPS[current - 1]?.label}
    </p>
    {/* Desktop: full bar */}
    <div className="hidden sm:flex items-center justify-center gap-0">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1">
            <div className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all',
              current > s.n  ? 'bg-tcm-gold text-tcm-navy'
              : current === s.n ? 'bg-tcm-orange text-white scale-110 shadow-orange'
              :                    'bg-gray-200 text-gray-400',
            ].join(' ')}>
              {current > s.n ? '✓' : s.n}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${current === s.n ? 'text-tcm-orange' : 'text-tcm-gray-mid'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px max-w-[40px] mx-1 mb-4 transition-colors ${current > s.n ? 'bg-tcm-gold' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ── Support type card ─────────────────────────────────────────
const TypeCard: React.FC<{
  value: SponsorType; label: string; desc: string;
  icon: React.ElementType; selected: boolean; onClick: () => void;
}> = ({ label, desc, icon: Icon, selected, onClick }) => (
  <button type="button" onClick={onClick}
    className={[
      'flex items-center gap-4 p-4 rounded-2xl border-2 text-left w-full transition-all duration-200',
      selected ? 'border-tcm-gold bg-tcm-gold/8 shadow-gold' : 'border-gray-200 bg-white hover:border-tcm-gold/50',
    ].join(' ')}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-tcm-gold/20 border border-tcm-gold/40' : 'bg-tcm-gray-soft border border-gray-200'}`}>
      <Icon className={`w-5 h-5 ${selected ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-black text-sm ${selected ? 'text-tcm-navy' : 'text-tcm-gray-dark'}`}>{label}</p>
      <p className="text-tcm-gray-mid text-xs leading-snug mt-0.5">{desc}</p>
    </div>
    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-tcm-gold' : 'text-gray-300'}`} />
  </button>
);

// ── generate a short submission reference ─────────────────────
function genRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'TCM-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ═══════════════════════════════════════════════════════════════
//  Main SponsorRegistration component
// ═══════════════════════════════════════════════════════════════
export const SponsorRegistration: React.FC = () => {
  const [step, setStep] = useState(1);

  // ── Step 1 — support type ──
  const [supportType,  setSupportType]  = useState<SponsorType | ''>('');
  const [department,   setDepartment]   = useState('');
  const [project,      setProject]      = useState('');
  const [description,  setDescription]  = useState('');
  const [merchItem,    setMerchItem]    = useState('');
  const [merchSize,    setMerchSize]    = useState('');
  const [merchQty,     setMerchQty]     = useState(1);
  const [otherDetails, setOtherDetails] = useState('');

  // ── Step 2 — amount ──
  const [amount,       setAmount]       = useState('');
  const [frequency,    setFrequency]    = useState('');

  // ── Step 3 — payment ──
  const [paymentMethods,    setPaymentMethods]    = useState<PaymentMethod[]>([]);
  const [loadingMethods,    setLoadingMethods]    = useState(false);
  const [selectedMethodId,  setSelectedMethodId]  = useState('');
  const [hasSent,           setHasSent]           = useState<boolean | null>(null);

  // ── Step 4 — transaction + registration ──
  const [transactionRef, setTransactionRef] = useState('');
  const [amountSent,     setAmountSent]     = useState('');
  const [paymentDate,    setPaymentDate]    = useState(new Date().toISOString().slice(0, 10));
  const [senderName,     setSenderName]     = useState('');
  const [paymentNotes,   setPaymentNotes]   = useState('');
  // Sponsor info
  const [fullName,       setFullName]       = useState('');
  const [email,          setEmail]          = useState('');
  const [phone,          setPhone]          = useState('');
  const [photoFile,      setPhotoFile]      = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);

  // ── Submission ──
  const [submitting,   setSubmitting]   = useState(false);
  const [submitErr,    setSubmitErr]    = useState('');
  const [submissionRef,setSubmissionRef]= useState('');

  // ── Validation errors ──
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load payment methods when we reach step 3 ──
  useEffect(() => {
    if (step !== 3) return;
    setLoadingMethods(true);
    supabase.from('payment_methods').select('*').eq('is_active', true).order('display_order')
      .then(({ data }) => {
        setPaymentMethods((data ?? []) as PaymentMethod[]);
        if (data && data.length > 0) setSelectedMethodId(data[0].id);
        setLoadingMethods(false);
      });
  }, [step]);

  // ── Step 1 validation ──
  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!supportType) { e.supportType = 'Please select what you would like to support.'; }
    if (supportType === 'department' && !department) { e.department = 'Please select a ministry department.'; }
    if (supportType === 'merchandise' && !merchItem) { e.merchItem = 'Please select a merchandise item.'; }
    if (supportType === 'other' && !otherDetails.trim()) { e.otherDetails = 'Please describe what you would like to support.'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 4 validation ──
  const validateStep4 = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) { e.fullName = 'Your full name is required.'; }
    if (!isValidEmail(email)) { e.email = 'A valid email address is required.'; }
    if (!transactionRef.trim()) { e.transactionRef = 'Please enter your transaction or reference number.'; }
    if (!amountSent.trim()) { e.amountSent = 'Please enter the amount you sent.'; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => {
    setStep(s => s - 1);
    setHasSent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Photo handler for PhotoUpload component ──
  const handleSavePhoto = async (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Final submission ──
  const handleSubmit = async () => {
    if (!validateStep4()) return;
    setSubmitting(true);
    setSubmitErr('');

    try {
      const ref = genRef();
      const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

      // 1. Upload photo if provided
      let avatarUrl: string | null = null;
      if (photoFile) {
        const ext  = photoFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `sponsor-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('profile-photos')
          .upload(path, photoFile, { upsert: true, contentType: photoFile.type });
        if (!uploadErr) {
          const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
      }

      // 2. Create sponsor master record
      const { data: sponsorData, error: sponsorErr } = await supabase
        .from('sponsors')
        .insert([{
          full_name:    fullName.trim(),
          email:        email.trim().toLowerCase() || null,
          phone:        phone.trim() || null,
          avatar_url:   avatarUrl,
          sponsor_type: supportType as SponsorType,
          is_active:    false,  // becomes true when admin verifies
          notes:        null,
        }])
        .select()
        .single();

      if (sponsorErr) throw new Error(sponsorErr.message);
      const sponsorId = sponsorData.id;

      // 3. Create sponsorship record (pending verification)
      const { data: recData, error: recErr } = await supabase
        .from('sponsorship_records')
        .insert([{
          sponsor_id:         sponsorId,
          support_type:       supportType as SponsorType,
          department:         supportType === 'department'   ? department    : null,
          project:            supportType === 'project'      ? project.trim() || null : null,
          merch_item:         supportType === 'merchandise'  ? merchItem     : null,
          merch_size:         (supportType === 'merchandise' && merchSize) ? merchSize : null,
          merch_quantity:     supportType === 'merchandise'  ? merchQty      : null,
          description:        description.trim() || null,
          other_details:      supportType === 'other'        ? otherDetails  : null,
          amount:             amount.trim() || null,
          frequency:          frequency || null,
          status:             'current',
          verification_status:'pending_verification',
          start_date:         new Date().toISOString().slice(0, 10),
          payment_method_id:  selectedMethod?.id || null,
          transaction_ref:    transactionRef.trim(),
          amount_sent:        amountSent.trim(),
          payment_date:       paymentDate || null,
          sender_name:        senderName.trim() || null,
          payment_notes:      paymentNotes.trim() || null,
          submission_ref:     ref,
        }])
        .select()
        .single();

      if (recErr) throw new Error(recErr.message);

      // 4. Write initial history entry
      await supabase.from('sponsorship_history').insert([{
        sponsorship_record_id: recData.id,
        sponsor_id:            sponsorId,
        previous_status:       null,
        new_status:            'pending_verification',
        change_note:           'Sponsorship registration submitted by user. Awaiting admin verification.',
      }]);

      setSubmissionRef(ref);
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitErr(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMerch = MERCH_ITEMS.find(m => m.value === merchItem);
  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

  // ── Icon map for support types ──
  const DEPT_ICONS: Record<string, React.ElementType> = {
    choir_music: Music, media_communications: Radio, youth_ministry: Users,
    childrens_ministry: Baby, evangelism_outreach: Globe, prayer_ministry: Heart,
    discipleship: BookOpen, missions: Target, leadership_dev: Megaphone,
    technical_it: Cpu, general_operations: Settings, other: HelpCircle,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="page-banner">
        <div className="page-banner-inner h-48 md:h-64">
          <div className="page-banner-content">
            <div>
              <span className="label-tag-light mb-3 block">Become a Sponsor</span>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Sponsor Registration
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-10">
          <div className="max-w-2xl mx-auto">

            {/* Step bar */}
            {step < 5 && <StepBar current={step} />}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
              <div className="p-6 md:p-10">

                {/* ════════════════════════════════
                    STEP 1 — Support Type
                ════════════════════════════════ */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-tcm-navy mb-1">
                        What would you like to support?
                      </h2>
                      <p className="text-tcm-gray-mid text-sm">
                        Choose the area of TCM you would like to support.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TypeCard value="general"    label="General Ministry"    desc="Support the overall ministry work" icon={Heart}       selected={supportType === 'general'}    onClick={() => setSupportType('general')} />
                      <TypeCard value="department" label="Ministry Department" desc="Support a specific department"      icon={Users}       selected={supportType === 'department'} onClick={() => setSupportType('department')} />
                      <TypeCard value="project"    label="Specific Project"    desc="Support a ministry project/event"  icon={Target}      selected={supportType === 'project'}    onClick={() => setSupportType('project')} />
                      <TypeCard value="merchandise"label="TCM Merchandise"     desc="Support through merchandise"        icon={ShoppingBag} selected={supportType === 'merchandise'} onClick={() => setSupportType('merchandise')} />
                      <TypeCard value="other"      label="Other"               desc="Something else you'd like to support" icon={HelpCircle} selected={supportType === 'other'}   onClick={() => setSupportType('other')} />
                    </div>
                    {errors.supportType && <p className="text-red-500 text-xs font-medium">⚠ {errors.supportType}</p>}

                    {/* Conditional sub-options */}
                    {supportType === 'department' && (
                      <div className="space-y-3">
                        <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">Select Department</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {DEPARTMENTS.map(d => {
                            const Icon = DEPT_ICONS[d.value] ?? Settings;
                            return (
                              <button key={d.value} type="button"
                                onClick={() => setDepartment(d.value)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${department === d.value ? 'border-tcm-gold bg-tcm-gold/8' : 'border-gray-200 bg-white hover:border-tcm-gold/40'}`}>
                                <Icon className={`w-4 h-4 flex-shrink-0 ${department === d.value ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />
                                <span className={`text-sm font-semibold ${department === d.value ? 'text-tcm-navy' : 'text-tcm-gray-dark'}`}>{d.label}</span>
                                {department === d.value && <CheckCircle2 className="w-4 h-4 text-tcm-gold ml-auto flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        {errors.department && <p className="text-red-500 text-xs font-medium">⚠ {errors.department}</p>}
                      </div>
                    )}

                    {supportType === 'project' && (
                      <Field label="Project / Activity Name" hint="what project are you supporting?">
                        <input value={project} onChange={e => setProject(e.target.value)}
                          placeholder="e.g. Annual Retreat 2026, Outreach Campaign…" className="input-field" />
                      </Field>
                    )}

                    {supportType === 'merchandise' && (
                      <div className="space-y-4">
                        <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">Select Item</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {MERCH_ITEMS.map(m => (
                            <button key={m.value} type="button" disabled={!m.available}
                              onClick={() => { setMerchItem(m.value); setMerchSize(''); }}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${!m.available ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : merchItem === m.value ? 'border-tcm-gold bg-tcm-gold/8' : 'border-gray-200 bg-white hover:border-tcm-gold/40'}`}>
                              <ShoppingBag className={`w-6 h-6 ${merchItem === m.value ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />
                              <span className={`text-xs font-bold text-center ${merchItem === m.value ? 'text-tcm-navy' : 'text-tcm-gray-dark'}`}>{m.label}</span>
                              {!m.available && <span className="text-[10px] text-tcm-gray-mid">Unavailable</span>}
                            </button>
                          ))}
                        </div>
                        {errors.merchItem && <p className="text-red-500 text-xs font-medium">⚠ {errors.merchItem}</p>}

                        {selectedMerch?.hasSize && (
                          <Field label="Size">
                            <div className="flex flex-wrap gap-2">
                              {SIZES.map(s => (
                                <button key={s} type="button" onClick={() => setMerchSize(s)}
                                  className={`w-12 h-12 rounded-xl border-2 text-sm font-black transition-all ${merchSize === s ? 'border-tcm-gold bg-tcm-gold text-tcm-navy shadow-gold' : 'border-gray-200 text-tcm-gray-dark hover:border-tcm-gold/50'}`}>{s}</button>
                              ))}
                            </div>
                          </Field>
                        )}

                        <Field label="Quantity">
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setMerchQty(q => Math.max(1, q - 1))}
                              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-tcm-navy hover:border-tcm-gold transition-colors text-lg">−</button>
                            <span className="w-10 text-center font-black text-tcm-navy text-lg">{merchQty}</span>
                            <button type="button" onClick={() => setMerchQty(q => Math.min(20, q + 1))}
                              className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-tcm-navy hover:border-tcm-gold transition-colors text-lg">+</button>
                          </div>
                        </Field>
                      </div>
                    )}

                    {supportType === 'other' && (
                      <Field label="Please describe what you would like to support" required error={errors.otherDetails}>
                        <textarea value={otherDetails} onChange={e => setOtherDetails(e.target.value)}
                          placeholder="Describe what you would like to support…" rows={3}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
                      </Field>
                    )}

                    {supportType && (
                      <Field label="Additional Description" hint="optional">
                        <input value={description} onChange={e => setDescription(e.target.value)}
                          placeholder="Any additional details about your support…" className="input-field" />
                      </Field>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════
                    STEP 2 — Support Details
                ════════════════════════════════ */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-tcm-navy mb-1">Support Details</h2>
                      <p className="text-tcm-gray-mid text-sm">
                        Let us know how much you intend to contribute (optional).
                      </p>
                    </div>

                    {/* Summary of what they're supporting */}
                    <div className="bg-tcm-gray-soft rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-2">You are supporting</p>
                      <p className="font-black text-tcm-navy">
                        {supportType === 'general'      && 'General Ministry Support'}
                        {supportType === 'department'   && (DEPARTMENTS.find(d => d.value === department)?.label ?? 'Ministry Department')}
                        {supportType === 'project'      && (project || 'Ministry Project')}
                        {supportType === 'merchandise'  && (MERCH_ITEMS.find(m => m.value === merchItem)?.label ?? 'TCM Merchandise')}
                        {supportType === 'other'        && 'Other Support'}
                      </p>
                      {description && <p className="text-tcm-gray-mid text-xs mt-0.5">{description}</p>}
                      {supportType === 'merchandise' && (
                        <p className="text-tcm-gray-mid text-xs mt-0.5">
                          {merchSize && `Size: ${merchSize} · `}Qty: {merchQty}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Intended Amount" hint="optional">
                        <input value={amount} onChange={e => setAmount(e.target.value)}
                          placeholder="e.g. 50,000 UGX or 20 USD" className="input-field" />
                      </Field>
                      <Field label="Frequency" hint="optional">
                        <select value={frequency} onChange={e => setFrequency(e.target.value)} className="select-field">
                          <option value="">Select…</option>
                          <option value="one_time">One-time</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annual">Annual</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-800 text-xs font-semibold mb-1">💡 Note</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        The amount above is your intended contribution. In the next step you will
                        send the actual support using TCM's official payment methods and enter
                        your transaction reference for verification.
                      </p>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════
                    STEP 3 — Send Support
                ════════════════════════════════ */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-tcm-navy mb-1">Send Your Support</h2>
                      <p className="text-tcm-gray-mid text-sm leading-relaxed">
                        Please send your support using one of the official TCM payment methods below.
                        After completing the transaction, return to this page and click{' '}
                        <strong className="text-tcm-navy">"I've Sent My Support"</strong>.
                      </p>
                    </div>

                    {loadingMethods ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-tcm-gold animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentMethods.map(pm => {
                          const isSelected = selectedMethodId === pm.id;
                          const isMtn  = pm.name.toLowerCase().includes('mtn');
                          const isBank = pm.name.toLowerCase().includes('bank');
                          return (
                            <div key={pm.id}
                              onClick={() => setSelectedMethodId(pm.id)}
                              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${isSelected ? 'border-tcm-gold bg-tcm-gold/5' : 'border-gray-200 bg-white hover:border-tcm-gold/40'}`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-tcm-gold/20 border border-tcm-gold/40' : 'bg-tcm-gray-soft border border-gray-200'}`}>
                                  {isBank ? <Building2 className={`w-5 h-5 ${isSelected ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} /> : <Smartphone className={`w-5 h-5 ${isSelected ? 'text-tcm-gold' : 'text-tcm-gray-mid'}`} />}
                                </div>
                                <div>
                                  <p className={`font-black text-sm ${isSelected ? 'text-tcm-navy' : 'text-tcm-gray-dark'}`}>{pm.name}</p>
                                  {pm.provider && <p className="text-tcm-gray-mid text-xs">{pm.provider}</p>}
                                </div>
                                {isSelected && <CheckCircle2 className="w-5 h-5 text-tcm-gold ml-auto flex-shrink-0" />}
                              </div>

                              {pm.account_number && (
                                <div className="flex items-center mb-2">
                                  <span className="text-tcm-gray-mid text-xs w-24 flex-shrink-0">Number/Account:</span>
                                  <span className="font-bold text-tcm-navy text-sm">{pm.account_number}</span>
                                  <CopyBtn text={pm.account_number} />
                                </div>
                              )}
                              {pm.account_name && (
                                <div className="flex items-center mb-2">
                                  <span className="text-tcm-gray-mid text-xs w-24 flex-shrink-0">Name:</span>
                                  <span className="font-semibold text-tcm-navy text-sm">{pm.account_name}</span>
                                </div>
                              )}
                              {pm.bank_name && (
                                <div className="flex items-center mb-2">
                                  <span className="text-tcm-gray-mid text-xs w-24 flex-shrink-0">Bank:</span>
                                  <span className="font-semibold text-tcm-navy text-sm">{pm.bank_name}</span>
                                </div>
                              )}
                              {pm.instructions && (
                                <div className="bg-tcm-gray-soft rounded-xl p-3 mt-3">
                                  <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-wider mb-1">Instructions</p>
                                  <p className="text-tcm-gray-dark text-xs leading-relaxed">{pm.instructions}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Important note */}
                    <div className="bg-tcm-navy-mid rounded-2xl p-5 border border-tcm-gold/20">
                      <p className="text-white font-bold text-sm mb-2">⚠ Important</p>
                      <ul className="text-white/70 text-xs leading-relaxed space-y-1.5">
                        <li>• After sending, <strong className="text-white">save your transaction ID / reference number</strong> — you will need it in the next step.</li>
                        <li>• Your sponsorship will only become active after the TCM administration verifies your transaction.</li>
                        <li>• Do not close this page until you have completed your registration.</li>
                      </ul>
                    </div>

                    {/* Sent / not sent buttons */}
                    {hasSent === null ? (
                      <div className="flex flex-col gap-3">
                        <button type="button" onClick={() => { setHasSent(true); next(); }}
                          className="btn-primary w-full py-4 justify-center text-base">
                          <CheckCircle2 className="w-5 h-5" /> I've Sent My Support →
                        </button>
                        <button type="button" onClick={() => setHasSent(false)}
                          className="btn-outline-navy w-full py-3 justify-center text-sm">
                          I Haven't Sent My Support Yet
                        </button>
                      </div>
                    ) : hasSent === false ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <p className="font-bold text-amber-800 mb-2">Please send your support first</p>
                        <p className="text-amber-700 text-sm leading-relaxed mb-4">
                          Choose one of the payment methods above and complete your transaction before continuing.
                          Once you have sent your support, click the button below.
                        </p>
                        <button type="button" onClick={() => setHasSent(null)}
                          className="btn-primary px-6 py-2.5 text-sm">
                          OK, I'll send it now
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* ════════════════════════════════
                    STEP 4 — Registration Details
                ════════════════════════════════ */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-tcm-navy mb-1">Complete Your Registration</h2>
                      <p className="text-tcm-gray-mid text-sm">
                        Enter your transaction details and personal information to complete your sponsorship registration.
                      </p>
                    </div>

                    {/* Transaction details */}
                    <div className="space-y-4">
                      <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">Transaction Details</p>

                      {selectedMethod && (
                        <div className="bg-tcm-gray-soft rounded-xl p-3 flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-tcm-gold flex-shrink-0" />
                          <p className="text-sm text-tcm-navy font-semibold">Paid via: {selectedMethod.name}</p>
                        </div>
                      )}

                      <Field label="Transaction / Reference Number" required error={errors.transactionRef}>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                          <input value={transactionRef} onChange={e => { setTransactionRef(e.target.value); setErrors(v => ({ ...v, transactionRef: '' })); }}
                            placeholder="e.g. AGF4XXXXXXXXXXX or bank ref…"
                            className={`input-field pl-10 ${errors.transactionRef ? 'input-field-error' : ''}`} />
                        </div>
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Amount Sent" required error={errors.amountSent}>
                          <input value={amountSent} onChange={e => { setAmountSent(e.target.value); setErrors(v => ({ ...v, amountSent: '' })); }}
                            placeholder="e.g. 50,000 UGX"
                            className={`input-field ${errors.amountSent ? 'input-field-error' : ''}`} />
                        </Field>
                        <Field label="Date of Transaction" hint="optional">
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
                              max={new Date().toISOString().slice(0, 10)} className="input-field pl-10" />
                          </div>
                        </Field>
                      </div>

                      <Field label="Sender Name / Account Name" hint="optional">
                        <input value={senderName} onChange={e => setSenderName(e.target.value)}
                          placeholder="Name shown on your transaction" className="input-field" />
                      </Field>

                      <Field label="Additional Payment Notes" hint="optional">
                        <textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)}
                          placeholder="Any extra information about your payment…" rows={2}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
                      </Field>
                    </div>

                    {/* Sponsor information */}
                    <div className="space-y-4">
                      <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest">Your Information</p>

                      {/* Profile photo */}
                      <div>
                        <p className="text-sm font-semibold text-tcm-navy mb-2">Profile Photo <span className="font-normal text-tcm-gray-mid text-xs">(optional)</span></p>
                        <PhotoUpload
                          currentUrl={photoPreview}
                          initials={fullName ? fullName[0].toUpperCase() : 'S'}
                          onSave={handleSavePhoto}
                        />
                      </div>

                      <Field label="Full Name" required error={errors.fullName}>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                          <input value={fullName} onChange={e => { setFullName(e.target.value); setErrors(v => ({ ...v, fullName: '' })); }}
                            placeholder="Your full name" autoComplete="name"
                            className={`input-field pl-10 ${errors.fullName ? 'input-field-error' : ''}`} />
                        </div>
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Email Address" required error={errors.email}>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })); }}
                              placeholder="your@email.com" autoComplete="email"
                              className={`input-field pl-10 ${errors.email ? 'input-field-error' : ''}`} />
                          </div>
                        </Field>
                        <Field label="Phone / WhatsApp" hint="optional">
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                              placeholder="+256 700 000 000" autoComplete="tel"
                              className="input-field pl-10" />
                          </div>
                        </Field>
                      </div>
                    </div>

                    {/* Privacy note */}
                    <div className="bg-tcm-sky-lt/60 border border-tcm-sky/40 rounded-xl p-4">
                      <p className="text-tcm-navy text-xs font-semibold mb-1">🔒 Privacy</p>
                      <p className="text-tcm-gray-dark text-xs leading-relaxed">
                        Your personal information and transaction details are stored securely and only
                        accessible to authorized TCM administrators for verification purposes.
      They will never be shared publicly.
                      </p>
                    </div>

                    {submitErr && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-600 text-sm font-medium">{submitErr}</p>
                      </div>
                    )}

                    <button type="button" onClick={handleSubmit} disabled={submitting}
                      className="btn-primary w-full py-4 justify-center text-base">
                      {submitting
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                        : <><Send className="w-5 h-5" /> Submit Sponsorship Registration</>
                      }
                    </button>
                  </div>
                )}

                {/* ════════════════════════════════
                    STEP 5 — Confirmation
                ════════════════════════════════ */}
                {step === 5 && (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-3">
                      Sponsorship Registration Submitted!
                    </h2>
                    <p className="text-tcm-gray-dark text-base leading-relaxed mb-6 max-w-md mx-auto">
                      Thank you for supporting Transform Christian Ministry. Your registration has been
                      received and is currently{' '}
                      <span className="font-bold text-amber-600">Pending Verification</span>.
                      The TCM administration will verify your support and update your sponsorship status.
                    </p>

                    {/* Reference number */}
                    <div className="bg-tcm-gray-soft rounded-2xl p-5 mb-6 max-w-sm mx-auto">
                      <p className="text-[10px] font-black text-tcm-gray-mid uppercase tracking-widest mb-2">
                        Your Submission Reference
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-2xl font-black text-tcm-navy tracking-wider">{submissionRef}</p>
                        <CopyBtn text={submissionRef} />
                      </div>
                      <p className="text-tcm-gray-mid text-xs mt-2">
                        Save this reference number. You may need it if you contact TCM about your sponsorship.
                      </p>
                    </div>

                    {/* What happens next */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 text-left max-w-sm mx-auto">
                      <p className="text-xs font-black text-tcm-gray-mid uppercase tracking-widest mb-3">What happens next</p>
                      <div className="space-y-3">
                        {[
                          'TCM administration will check your transaction against MTN or bank records.',
                          'Once verified, your sponsorship status will become "Current Sponsor".',
                          'You may be contacted if additional information is needed.',
                          'Thank you for believing in the vision of Transform Christian Ministry.',
                        ].map((text, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-tcm-gold/20 text-tcm-navy text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-tcm-gray-dark text-sm leading-snug">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scripture */}
                    <blockquote className="border-l-2 border-tcm-gold/50 pl-4 mb-6 text-left max-w-sm mx-auto">
                      <p className="text-tcm-gray-dark text-sm leading-relaxed italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                      </p>
                      <cite className="text-tcm-gold text-xs font-bold not-italic mt-1 block">— 2 Corinthians 9:7</cite>
                    </blockquote>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link to="/" className="btn-outline-navy px-8 py-3">Back to Home</Link>
                      <Link to="/support" className="btn-primary px-8 py-3">View Support Page</Link>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Navigation buttons (steps 1–4, not step 3 which has its own) ── */}
              {step < 5 && step !== 3 && (
                <div className="flex items-center justify-between px-6 pb-6 md:px-10">
                  <div>
                    {step > 1 && (
                      <button type="button" onClick={back}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    )}
                  </div>
                  <div>
                    {step < 4 && (
                      <button type="button" onClick={next}
                        className="btn-primary px-8 py-2.5">
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {step === 3 && hasSent === null && (
                <div className="flex items-center px-6 pb-6 md:px-10">
                  <button type="button" onClick={back}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
