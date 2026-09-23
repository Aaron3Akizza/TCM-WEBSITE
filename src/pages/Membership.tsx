import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar }  from '../components/layout/Navbar';
import { Footer }  from '../components/layout/Footer';
import { Loader2, Eye, EyeOff, CheckCircle2, Camera, Users } from 'lucide-react';
import { signUp }  from '../lib/auth';
import { supabase } from '../lib/supabase';
import { isValidEmail } from '../lib/utils';
import type { MemberPosition, CareerStatus, Gender } from '../types';

// ── Option lists ─────────────────────────────────────────────
const POSITIONS: { value: MemberPosition; label: string }[] = [
  { value: 'member',          label: 'Member'            },
  { value: 'pastor',          label: 'Pastor'            },
  { value: 'ministry_leader', label: 'Ministry Leader'   },
  { value: 'media',           label: 'Media'             },
  { value: 'worship',         label: 'Worship'           },
  { value: 'ushering',        label: 'Ushering'          },
  { value: 'evangelism',      label: 'Evangelism'        },
  { value: 'youth',           label: 'Youth'             },
  { value: 'administration',  label: 'Administration'    },
  { value: 'other',           label: 'Other'             },
];

const CAREER_STATUS: { value: CareerStatus; label: string }[] = [
  { value: 'student',        label: 'Student'        },
  { value: 'employed',       label: 'Employed'       },
  { value: 'self_employed',  label: 'Self-Employed'  },
  { value: 'unemployed',     label: 'Unemployed'     },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'other',          label: 'Other'          },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male',             label: 'Male'            },
  { value: 'female',           label: 'Female'          },
  { value: 'prefer_not_to_say',label: 'Prefer not to say' },
];

// ── Field component helpers ───────────────────────────────────
const Field: React.FC<{ label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }> =
  ({ label, required, hint, error, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-tcm-navy">
        {label}{required && <span className="text-tcm-orange ml-1">*</span>}
        {hint && <span className="font-normal text-tcm-gray-mid ml-2 text-xs">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">⚠ {error}</p>}
    </div>
  );

// ── Main component ────────────────────────────────────────────
export const Membership: React.FC = () => {
  const [step,       setStep]    = useState<1|2|3>(1);
  const [loading,    setLoading] = useState(false);
  const [success,    setSuccess] = useState(false);
  const [showPwd,    setShowPwd] = useState(false);
  const [showPwd2,   setShowPwd2]= useState(false);
  const [errors,     setErrors]  = useState<Record<string,string>>({});
  const [globalErr,  setGlobalErr] = useState('');

  // Step 1 — Account
  const [fullName,  setFullName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Step 2 — Ministry info
  const [position,     setPosition]     = useState<MemberPosition>('member');
  const [gender,       setGender]       = useState<Gender | ''>('');
  const [dob,          setDob]          = useState('');
  const [faith,        setFaith]        = useState('');
  const [careerStatus, setCareerStatus] = useState<CareerStatus | ''>('');
  const [occupation,   setOccupation]   = useState('');
  const [studentStatus,setStudentStatus]= useState('');
  const [school,       setSchool]       = useState('');

  // Step 3 — Contact
  const [phone,   setPhone]   = useState('');
  const [address, setAddress] = useState('');

  // ── Photo handler ──
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(v => ({ ...v, photo: 'Photo must be under 5MB' })); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors(v => { const n = { ...v }; delete n.photo; return n; });
  };

  // ── Validate step ──
  const validateStep = (s: 1|2|3): boolean => {
    const e: Record<string,string> = {};
    if (s === 1) {
      if (!fullName.trim())                      e.fullName  = 'Full name is required';
      if (!username.trim())                      e.username  = 'Username is required';
      else if (!/^[a-z0-9_]{3,20}$/.test(username.trim()))
                                                 e.username  = 'Username: 3-20 chars, lowercase letters/numbers/_';
      if (!isValidEmail(email))                  e.email     = 'Valid email is required';
      if (password.length < 8)                   e.password  = 'Password must be at least 8 characters';
      if (password !== password2)                e.password2 = 'Passwords do not match';
    }
    if (s === 2) {
      if (!position)                             e.position  = 'Please select your ministry position';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 3) as 1|2|3);
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as 1|2|3);

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setLoading(true);
    setGlobalErr('');

    try {
      // 1. Create auth user
      const { user, error: authErr } = await signUp(email, password, fullName, { position, phone: phone || undefined });
      if (authErr) { setGlobalErr(authErr.message); setLoading(false); return; }
      if (!user) { setGlobalErr('Account creation failed. Please try again.'); setLoading(false); return; }

      // 2. Upload photo if provided
      let avatarUrl: string | null = null;
      if (photoFile) {
        const ext  = photoFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('profile-photos').upload(path, photoFile, { upsert: true });
        if (!uploadErr) {
          const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
      }

      // 3. Upsert full profile
      await supabase.from('profiles').upsert({
        id:             user.id,
        full_name:      fullName.trim(),
        username:       username.trim().toLowerCase(),
        email:          email.trim().toLowerCase(),
        phone:          phone     || null,
        avatar_url:     avatarUrl,
        position,
        gender:         gender        || null,
        date_of_birth:  dob           || null,
        faith:          faith         || null,
        career_status:  careerStatus  || null,
        occupation:     occupation    || null,
        student_status: studentStatus || null,
        school:         school        || null,
        address:        address       || null,
        role:           'member',
      }, { onConflict: 'id' });

      setSuccess(true);
    } catch (err: any) {
      setGlobalErr(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicator ──
  const StepDot = ({ n, label }: { n: number; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className={[
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300',
        step > n  ? 'bg-tcm-gold text-tcm-navy'
        : step === n ? 'bg-tcm-orange text-white scale-110 shadow-orange'
        :              'bg-gray-200 text-gray-400',
      ].join(' ')}>{step > n ? '✓' : n}</div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${step === n ? 'text-tcm-orange' : 'text-tcm-gray-mid'}`}>{label}</span>
    </div>
  );

  if (success) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl border border-tcm-gold/20 shadow-gold p-10">
            <div className="w-20 h-20 rounded-full bg-tcm-gold/15 border-2 border-tcm-gold/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-tcm-gold" />
            </div>
            <h2 className="text-3xl font-black text-tcm-navy tracking-tight mb-3">Welcome to TCM!</h2>
            <p className="text-tcm-gray-dark text-base leading-relaxed mb-2">
              Your membership registration is complete.
            </p>
            <p className="text-tcm-gray-mid text-sm mb-8">
              Please check your email to verify your account, then sign in to access your member profile.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/sign-in" className="btn-primary w-full justify-center py-3.5">
                Sign In to Your Account
              </Link>
              <Link to="/" className="btn-outline-navy w-full justify-center py-3.5">Back to Home</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tcm-gray-soft">

        {/* Banner */}
        <header className="bg-navy-gradient py-14 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid" />
          <div className="container-tcm text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/50 mx-auto mb-5">
              <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
            </div>
            <span className="label-tag-light justify-center mb-3 block">Membership</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              Become Part of TCM
            </h1>
            <p className="text-white/55 text-lg max-w-xl mx-auto">
              Join our growing community and stay connected with the ministry, its people and its mission.
            </p>
          </div>
        </header>

        {/* Form */}
        <div className="container-tcm py-14">
          <div className="max-w-2xl mx-auto">

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <StepDot n={1} label="Account" />
              <div className={`flex-1 h-px max-w-[60px] transition-colors duration-300 ${step > 1 ? 'bg-tcm-gold' : 'bg-gray-200'}`} />
              <StepDot n={2} label="Ministry" />
              <div className={`flex-1 h-px max-w-[60px] transition-colors duration-300 ${step > 2 ? 'bg-tcm-gold' : 'bg-gray-200'}`} />
              <StepDot n={3} label="Contact" />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />

              <form onSubmit={handleSubmit} noValidate>
                <div className="p-8 md:p-10">

                  {/* ── STEP 1: Account ── */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <h2 className="text-2xl font-black text-tcm-navy mb-6">Account Information</h2>

                      {/* Photo upload */}
                      <div className="flex justify-center mb-2">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-tcm-gray-soft border-2 border-dashed border-tcm-gold/40 flex items-center justify-center">
                            {photoPreview
                              ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                              : <Camera className="w-8 h-8 text-tcm-gold/50" />
                            }
                          </div>
                          <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-tcm-gold flex items-center justify-center cursor-pointer hover:bg-tcm-gold-lt transition-colors shadow-gold" aria-label="Upload profile photo">
                            <Camera className="w-4 h-4 text-tcm-navy" />
                          </label>
                          <input id="photo-upload" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
                        </div>
                      </div>
                      {errors.photo && <p className="text-center text-xs text-red-500">{errors.photo}</p>}
                      <p className="text-center text-xs text-tcm-gray-mid -mt-2">Profile photo (optional, max 5MB)</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Full Name" required error={errors.fullName}>
                          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                            className={`input-field ${errors.fullName ? 'input-field-error' : ''}`} autoComplete="name" />
                        </Field>
                        <Field label="Username" required hint="unique, lowercase" error={errors.username}>
                          <input value={username} onChange={e => setUsername(e.target.value.toLowerCase())} placeholder="e.g. john_doe"
                            className={`input-field ${errors.username ? 'input-field-error' : ''}`} autoComplete="username" />
                        </Field>
                      </div>

                      <Field label="Email Address" required error={errors.email}>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                          className={`input-field ${errors.email ? 'input-field-error' : ''}`} autoComplete="email" />
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Password" required hint="min 8 chars" error={errors.password}>
                          <div className="relative">
                            <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                              placeholder="At least 8 characters" className={`input-field pr-11 ${errors.password ? 'input-field-error' : ''}`} autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPwd(v => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                              aria-label={showPwd ? 'Hide password' : 'Show password'}>
                              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Confirm Password" required error={errors.password2}>
                          <div className="relative">
                            <input type={showPwd2 ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)}
                              placeholder="Repeat password" className={`input-field pr-11 ${errors.password2 ? 'input-field-error' : ''}`} autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPwd2(v => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                              aria-label={showPwd2 ? 'Hide password' : 'Show password'}>
                              {showPwd2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Ministry Info ── */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <h2 className="text-2xl font-black text-tcm-navy mb-6">Ministry Information</h2>

                      <Field label="Ministry Position / Role" required error={errors.position}>
                        <select value={position} onChange={e => setPosition(e.target.value as MemberPosition)}
                          className={`select-field ${errors.position ? 'input-field-error' : ''}`}>
                          {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Gender" hint="optional">
                          <select value={gender} onChange={e => setGender(e.target.value as Gender)} className="select-field">
                            <option value="">Prefer not to say</option>
                            {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                          </select>
                        </Field>
                        <Field label="Date of Birth" hint="optional">
                          <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                            className="input-field" max={new Date().toISOString().split('T')[0]} />
                        </Field>
                      </div>

                      <Field label="Faith / Church Background" hint="optional">
                        <input value={faith} onChange={e => setFaith(e.target.value)}
                          placeholder="e.g. Pentecostal, Catholic, Baptist…" className="input-field" />
                      </Field>

                      <Field label="Current Career / Life Status" hint="optional">
                        <select value={careerStatus} onChange={e => setCareerStatus(e.target.value as CareerStatus)} className="select-field">
                          <option value="">Select status</option>
                          {CAREER_STATUS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </Field>

                      {(careerStatus === 'employed' || careerStatus === 'self_employed' || careerStatus === 'business_owner') && (
                        <Field label="Occupation / Career" hint="optional">
                          <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Your occupation" className="input-field" />
                        </Field>
                      )}

                      {careerStatus === 'student' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Student Status" hint="optional">
                            <input value={studentStatus} onChange={e => setStudentStatus(e.target.value)} placeholder="e.g. S.4, Year 2" className="input-field" />
                          </Field>
                          <Field label="School / Institution" hint="optional">
                            <input value={school} onChange={e => setSchool(e.target.value)} placeholder="School name" className="input-field" />
                          </Field>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── STEP 3: Contact ── */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <h2 className="text-2xl font-black text-tcm-navy mb-6">Contact Information</h2>
                      <p className="text-tcm-gray-mid text-sm -mt-4 mb-2">
                        This information is kept private and only visible to ministry administrators.
                      </p>

                      <Field label="Phone Number" hint="optional">
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="+256 700 000 000" className="input-field" autoComplete="tel" />
                      </Field>

                      <Field label="Location / Address" hint="optional">
                        <textarea value={address} onChange={e => setAddress(e.target.value)}
                          placeholder="City, district or general area" rows={3}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-tcm-navy placeholder-tcm-gray-mid text-sm resize-none focus:outline-none focus:border-tcm-gold transition-colors" />
                      </Field>

                      {/* Privacy note */}
                      <div className="bg-tcm-sky-lt/60 border border-tcm-sky/40 rounded-xl p-4">
                        <p className="text-tcm-navy text-xs font-semibold mb-1">🔒 Your privacy matters</p>
                        <p className="text-tcm-gray-dark text-xs leading-relaxed">
                          Your personal details are stored securely and are never shared publicly.
                          Sensitive information (date of birth, phone, address) is only accessible
                          to authorized ministry administrators.
                        </p>
                      </div>

                      {globalErr && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <p className="text-red-600 text-sm font-medium">⚠ {globalErr}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Navigation buttons ── */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <div>
                      {step > 1 && (
                        <button type="button" onClick={prevStep}
                          className="btn-outline-navy px-6 py-2.5 text-sm">
                          ← Back
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {step < 3 ? (
                        <button type="button" onClick={nextStep}
                          className="btn-primary px-8 py-2.5 text-sm">
                          Continue →
                        </button>
                      ) : (
                        <button type="submit" disabled={loading}
                          className="btn-primary px-8 py-2.5 text-sm">
                          {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
                            : <><Users className="w-4 h-4" /> Complete Registration</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm text-tcm-gray-mid mt-6">
              Already a member?{' '}
              <Link to="/sign-in" className="text-tcm-orange font-bold hover:underline">Sign in</Link>
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
