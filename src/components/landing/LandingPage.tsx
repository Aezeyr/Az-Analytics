import React from 'react';
import {
  ShieldCheck,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Database,
  Layers,
  Search,
  Zap,
  Globe,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { DemoBadge } from '../common/DemoBadge';

interface LandingPageProps {
  onEnterDemo: (featureTab?: string) => void;
  onOpenGoogleAuth: () => void;
  onOpenEmailAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDemo,
  onOpenGoogleAuth,
  onOpenEmailAuth,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-600/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-medium mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold text-white">AZ Analytics</span>
            <span className="text-slate-500">|</span>
            <span>Facebook Page Intelligence Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Analyze. Compare.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Improve.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Smart Facebook Page analytics, competitor insights, and performance reports in one place.
          </p>

          {/* Call to actions */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => onEnterDemo('dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Try Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenGoogleAuth}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Transparent data disclaimer */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Instant sandbox demo mode available without registration.</span>
          </div>

          {/* Interactive Hero Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-2 sm:p-4 shadow-2xl backdrop-blur-md">
            <div className="bg-slate-950 rounded-xl p-4 sm:p-6 border border-slate-800/80 text-left">
              {/* Fake browser bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 ml-2">az-analytics.app/audit/demo</span>
                </div>
                <DemoBadge label="DEMO PREVIEW" size="sm" />
              </div>

              {/* Sample overview snippet */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">AUDIT SCORE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-400">79</span>
                    <span className="text-xs text-slate-500">/ 100 Demo Score</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/90 mt-1 block">Good optimization foundation</span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">POSTING FREQUENCY</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">3.4x</span>
                    <span className="text-xs text-slate-500">per week</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Matches industry average</span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">AVG ENGAGEMENT</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-400">3.42%</span>
                    <span className="text-xs text-slate-500">rate</span>
                  </div>
                  <span className="text-[10px] text-blue-400/90 mt-1 block">+0.8% above benchmark</span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">TOP FORMAT</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-indigo-300">Short Video</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 mt-1 block">Yields 2.3x higher shares</span>
                </div>
              </div>

              {/* Sample Action insight */}
              <div className="mt-4 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center justify-between text-xs text-blue-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Recommendation: Increase Call-To-Action (CTA) clarity in organic video descriptions to lift referral traffic.</span>
                </div>
                <button
                  onClick={() => onEnterDemo('audit')}
                  className="font-semibold text-blue-400 hover:text-blue-300 underline ml-2 shrink-0 cursor-pointer"
                >
                  View Full Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation Section */}
      <section className="py-16 md:py-24 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-semibold mb-3 block">
            Practical Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white max-w-2xl mx-auto leading-snug">
            Get actionable insights from your Facebook Page data and understand what is working, what needs improvement, and how your performance compares with competitors.
          </h2>
          <p className="mt-4 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            AZ Analytics evaluates page structure, posting consistency, content formats, and audience signals to turn raw observations into structured strategic next steps.
          </p>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Core Modules
          </span>
          <h3 className="text-3xl font-bold text-white mt-2">
            Engineered for Modern Social Strategists
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Facebook Page Audit */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-7 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2.5">Facebook Page Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Inspect your Facebook Page overview, profile completeness, posting consistency, CTA implementation, and SEO keyword discoverability.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Profile completeness & contact verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Content quality & variety breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SEO keywords and CTA clarity scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prioritized action recommendations</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onEnterDemo('audit')}
              className="mt-8 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Audit Demo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Competitor Analysis */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-7 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2.5">Competitor Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Benchmark your primary page against up to 3 competitors across posting cadence, engagement signals, caption styles, and content mix.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Side-by-side comparison matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Posting frequency & engagement metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Hashtag & CTA pattern detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Actionable content gap opportunities</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onEnterDemo('competitor')}
              className="mt-8 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Competitor Demo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Performance Reports */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-7 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-sky-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2.5">Performance Reports</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Generate date-range performance summaries over 7, 30, or 90 days with trend charts, top-performing post breakdowns, and printable reports.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Reactions, comments, and shares trend charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Content type distribution breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Top-performing post highlights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Print-ready PDF & CSV report export</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onEnterDemo('performance')}
              className="mt-8 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Reports Demo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Realistic Methodology & Data Standards Notice */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-left">
                <h4 className="font-bold text-white text-base">Our Data Standards & Honesty Principle</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We believe in truthful analytics. In public demo mode, all metrics are explicitly marked as <b>DEMO DATA</b> to showcase platform features without misrepresenting numbers.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>No fake viral reach guarantees</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>No unauthorized data scraping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Meta Graph API compliant structure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloudflare & Supabase Ready Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-2 block">
          Modern Architecture
        </span>
        <h3 className="text-2xl font-bold text-white mb-8">
          Built for Fast Deployment & Secure Scalability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <Database className="w-5 h-5 text-emerald-400 mb-2" />
            <h5 className="font-bold text-white text-sm mb-1">Supabase & PostgreSQL</h5>
            <p className="text-xs text-slate-400">
              Clean service layer ready for Supabase Auth, Row Level Security (RLS), and database persistence without frontend redesign.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <Globe className="w-5 h-5 text-amber-400 mb-2" />
            <h5 className="font-bold text-white text-sm mb-1">Cloudflare Pages & GitHub</h5>
            <p className="text-xs text-slate-400">
              Production Vite bundle deployable in seconds via GitHub actions to Cloudflare Pages edge network worldwide.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <Layers className="w-5 h-5 text-blue-400 mb-2" />
            <h5 className="font-bold text-white text-sm mb-1">Meta API Abstraction</h5>
            <p className="text-xs text-slate-400">
              Ready for Meta Graph API integration with backend proxy tokens, protecting secrets from browser exposure.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              AZ
            </div>
            <span className="font-bold text-slate-300">AZ Analytics</span>
            <span>— Facebook Page Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onEnterDemo('dashboard')} className="hover:text-slate-300 transition-colors">
              Demo Dashboard
            </button>
            <button onClick={onOpenGoogleAuth} className="hover:text-slate-300 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
