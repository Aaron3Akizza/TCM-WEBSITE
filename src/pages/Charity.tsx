import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar }  from '../components/layout/Navbar';
import { Footer }  from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import {
  Gift, MapPin, Users, Calendar, Heart, Loader2,
  AlertTriangle, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';

type ProgramStatus   = 'planned' | 'active' | 'completed' | 'cancelled';
type ProgramCategory = 'seed_project' | 'outreach' | 'community' | 'equipment' | 'conference' | 'education' | 'medical' | 'other';

interface CharityProgram {
  id:            string;
  title:         string;
  description:   string | null;
  category:      ProgramCategory;
  status:        ProgramStatus;
  target_amount: string | null;
  amount_raised: string | null;
  start_date:    string | null;
  end_date:      string | null;
  location:      string | null;
  beneficiaries: string | null;
}

const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  seed_project: 'Seed Project', outreach: 'Outreach',
  community: 'Community', equipment: 'Equipment',
  conference: 'Conference', education: 'Education',
  medical: 'Medical', other: 'Other',
};

const STATUS_CONFIG: Record<ProgramStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planned:   { label: 'Upcoming',  color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',   icon: Clock        },
  active:    { label: 'Active',    color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'text-tcm-gold',  bg: 'bg-tcm-gold/10 border-tcm-gold/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-500',   bg: 'bg-red-50 border-red-200',     icon: AlertTriangle },
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Build the support URL pre-filled with the program details
function supportUrl(program: CharityProgram): string {
  const params = new URLSearchParams({
    type:    'project',
    project: program.title,
    desc:    program.description ?? '',
  });
  return `/sponsor-registration?${params.toString()}`;
}

export const Charity: React.FC = () => {
  const [programs, setPrograms] = useState<CharityProgram[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    supabase
      .from('charity_programs')
      .select('id,title,description,category,status,target_amount,amount_raised,start_date,end_date,location,beneficiaries')
      .in('status', ['active', 'planned', 'completed'])
      .order('status')
      .order('start_date', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError('Could not load programs.');
        else setPrograms((data ?? []) as CharityProgram[]);
        setLoading(false);
      });
  }, []);

  const active    = programs.filter(p => p.status === 'active');
  const upcoming  = programs.filter(p => p.status === 'planned');
  const completed = programs.filter(p => p.status === 'completed');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="page-banner">
        <div className="page-banner-inner h-56 md:h-72">
          <div className="page-banner-content">
            <div>
              <span className="label-tag-light mb-3 block">Community Impact</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Charity Programs</h1>
              <p className="text-white/55 mt-2 text-base max-w-xl">
                Join TCM in making a difference — support an active program or give towards an upcoming initiative.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tcm-gray-soft">
        <div className="container-tcm py-14">

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-tcm-gold animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-8">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            </div>
          )}

          {!loading && !error && programs.length === 0 && (
            <div className="text-center py-20">
              <Gift className="w-14 h-14 text-tcm-gray-mid mx-auto mb-4" />
              <p className="font-black text-tcm-navy text-xl mb-2">No programs listed yet</p>
              <p className="text-tcm-gray-mid">Check back soon — TCM has exciting charity initiatives coming up.</p>
            </div>
          )}

          {/* ── Active programs ── */}
          {active.length > 0 && (
            <section className="mb-14">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-8 rounded-xl bg-green-100 border border-green-300 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-tcm-navy">Active Programs</h2>
                  <p className="text-tcm-gray-mid text-sm">Currently running — your support makes an immediate impact</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {active.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </section>
          )}

          {/* ── Upcoming programs ── */}
          {upcoming.length > 0 && (
            <section className="mb-14">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-tcm-navy">Upcoming Programs</h2>
                  <p className="text-tcm-gray-mid text-sm">Coming soon — be an early supporter</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </section>
          )}

          {/* ── Completed programs ── */}
          {completed.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-8 rounded-xl bg-tcm-gold/15 border border-tcm-gold/30 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-tcm-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-tcm-navy">Completed Programs</h2>
                  <p className="text-tcm-gray-mid text-sm">Programs TCM has successfully carried out</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completed.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </section>
          )}

          {/* ── General support CTA ── */}
          {!loading && (
            <div className="mt-16 bg-navy-gradient rounded-3xl p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 dot-grid" />
              <div className="relative z-10">
                <Heart className="w-12 h-12 text-tcm-gold mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white tracking-tight mb-3">Support the Ministry Generally</h2>
                <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-7">
                  Can't find a specific program? You can support Transform Christian Ministries generally
                  and your contribution will go where it's needed most.
                </p>
                <Link to="/sponsor-registration"
                  className="btn-gold inline-flex items-center gap-2 px-8 py-4 text-base">
                  <Heart className="w-5 h-5" /> Support TCM
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

// ── Program Card ──────────────────────────────────────────────
const ProgramCard: React.FC<{ program: CharityProgram }> = ({ program }) => {
  const cfg = STATUS_CONFIG[program.status];
  const StatusIcon = cfg.icon;
  const canSupport = program.status === 'active' || program.status === 'planned';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Top accent */}
      <div className={`h-1 ${program.status === 'active' ? 'bg-gradient-to-r from-green-400 to-green-600' : program.status === 'planned' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-tcm-gold to-tcm-gold-lt'}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tcm-gray-soft text-tcm-gray-dark text-[11px] font-bold mb-2">
              {CATEGORY_LABELS[program.category]}
            </span>
            <h3 className="font-black text-tcm-navy text-lg leading-tight">{program.title}</h3>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        {program.description && (
          <p className="text-tcm-gray-dark text-sm leading-relaxed mb-4 flex-1">
            {program.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-5">
          {program.location && (
            <div className="flex items-center gap-2 text-tcm-gray-mid text-xs">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{program.location}</span>
            </div>
          )}
          {program.beneficiaries && (
            <div className="flex items-center gap-2 text-tcm-gray-mid text-xs">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{program.beneficiaries}</span>
            </div>
          )}
          {(program.start_date || program.end_date) && (
            <div className="flex items-center gap-2 text-tcm-gray-mid text-xs">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {fmtDate(program.start_date)}
                {program.end_date && ` → ${fmtDate(program.end_date)}`}
              </span>
            </div>
          )}
          {(program.target_amount || program.amount_raised) && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
              {program.target_amount && (
                <div className="text-xs">
                  <span className="text-tcm-gray-mid">Target: </span>
                  <span className="font-bold text-tcm-navy">{program.target_amount}</span>
                </div>
              )}
              {program.amount_raised && (
                <div className="text-xs">
                  <span className="text-tcm-gray-mid">Raised: </span>
                  <span className="font-bold text-green-600">{program.amount_raised}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Support button */}
        {canSupport ? (
          <Link
            to={supportUrl(program)}
            className="btn-primary w-full justify-center py-3 mt-auto"
          >
            <Heart className="w-4 h-4" />
            Support This Program
          </Link>
        ) : (
          <div className="w-full py-3 rounded-full bg-tcm-gray-soft text-tcm-gray-mid text-sm font-semibold text-center mt-auto">
            Program Completed
          </div>
        )}
      </div>
    </div>
  );
};
