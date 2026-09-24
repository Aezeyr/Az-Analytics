import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Printer,
  Sparkles,
  Layers,
  TrendingUp,
  MessageSquare,
  Share2,
  ThumbsUp,
  Globe,
  Mail,
  Phone,
  MapPin,
  Check,
  ArrowRight,
  Info,
  Loader2,
} from 'lucide-react';
import { PageAuditResult, UserProfile } from '../../types';
import { pageAuditService, validateFacebookUrl } from '../../services/pageAudit/pageAuditService';
import { databaseService } from '../../services/database/databaseService';
import { DemoBadge } from '../common/DemoBadge';
import { ReportPrintModal } from '../common/ReportPrintModal';

interface PageAuditViewProps {
  currentUser: UserProfile | null;
  onOpenProtectedGate: (title?: string) => void;
  isDemoMode: boolean;
}

export const PageAuditView: React.FC<PageAuditViewProps> = ({
  currentUser,
  onOpenProtectedGate,
  isDemoMode,
}) => {
  const [urlInput, setUrlInput] = useState('https://www.facebook.com/demobusinesspage');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<PageAuditResult | null>(() =>
    pageAuditService.getSampleDemoAudit()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    const validation = validateFacebookUrl(urlInput);
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Please enter a valid Facebook Page URL.');
      return;
    }

    setLoading(true);
    setLoadingStep('Analyzing your page structure...');

    try {
      setTimeout(() => setLoadingStep('Processing content & engagement signals...'), 500);
      setTimeout(() => setLoadingStep('Generating SEO & heuristic insights...'), 1000);

      const result = await pageAuditService.runPageAudit(urlInput, !currentUser);
      setAuditResult(result);
    } catch (err: any) {
      setError(err?.message || 'Unable to audit Facebook Page. Please check the URL.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSaveToReports = async () => {
    if (!currentUser) {
      onOpenProtectedGate('Sign in with Google to save this Facebook Page audit to your account workspace.');
      return;
    }

    if (!auditResult) return;

    try {
      await databaseService.saveReport({
        userId: currentUser.id,
        reportName: `Page Audit: ${auditResult.pageName}`,
        reportType: 'audit',
        pageName: auditResult.pageName,
        pageUrl: auditResult.pageUrl,
        status: 'Ready',
        data: auditResult,
        isDemoData: auditResult.isDemoData,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setError('Your audit report could not be saved. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Facebook Page Audit</h1>
              <DemoBadge label="DEMO SERVICE" size="sm" />
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Audit page completeness, evaluate content formats, uncover SEO keywords, and diagnose engagement health.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
            <span>Graph API Sandbox Mode:</span>{' '}
            <span className="text-amber-400 font-bold">Demo Data Active</span>
          </div>
        </div>

        {/* Audit Search Form */}
        <form onSubmit={handleAnalyze} className="mt-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.facebook.com/yourpage"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Auditing...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Analyze Page</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
            <span>Quick fill:</span>
            <button
              type="button"
              onClick={() => setUrlInput('https://www.facebook.com/demobusinesspage')}
              className="text-blue-400 hover:underline"
            >
              Demo Business Page
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setUrlInput('https://www.facebook.com/apextechcloud')}
              className="text-blue-400 hover:underline"
            >
              ApexTech Cloud
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-white space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="font-bold text-lg">{loadingStep}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extracting profile metadata, assessing content mix, and structuring recommendations...
          </p>
        </div>
      )}

      {/* Audit Results Container */}
      {!loading && auditResult && (
        <div className="space-y-6">
          {/* Action and status bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                FB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-white">{auditResult.pageName}</h2>
                  <DemoBadge label="DEMO DATA" size="sm" />
                </div>
                <p className="text-xs text-slate-400 font-mono truncate max-w-sm">
                  {auditResult.pageUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToReports}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition-colors cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Saved to Reports!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Report</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export / Print</span>
              </button>
            </div>
          </div>

          {/* Section F: Overall Audit Summary Card (Requirement #6F) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-2xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Visual Demo Score Circle */}
                <div className="relative w-24 h-24 rounded-full bg-slate-950 border-4 border-emerald-500 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                  <span className="text-3xl font-black text-emerald-400 leading-none">
                    {auditResult.overallScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">/100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
                      OVERALL AUDIT SUMMARY
                    </span>
                    <DemoBadge label="Demo Score" size="sm" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {auditResult.summary.headlineInsight}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Based on profile completeness, content cadence, keyword discoverability, and audience feedback signals.
                  </p>
                </div>
              </div>

              {/* Quick strengths & improvement count */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-lg font-bold text-emerald-400 block">
                    {auditResult.summary.strengths.length}
                  </span>
                  <span className="text-[11px] text-slate-400">Key Strengths</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-lg font-bold text-amber-400 block">
                    {auditResult.recommendations.length}
                  </span>
                  <span className="text-[11px] text-slate-400">Action Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section A: Page Overview (Requirement #6A) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  A. Page Overview & Profile Completeness
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Completeness: <b className="text-emerald-400">{auditResult.overview.profileCompleteness}%</b>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold">BRAND & CATEGORY</span>
                <p className="text-sm font-bold text-white">{auditResult.overview.pageName}</p>
                <p className="text-slate-300">{auditResult.overview.category}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {auditResult.overview.isVerified ? 'Verified Badge' : 'Standard Profile'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold">ABOUT SECTION</span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{auditResult.overview.about}"
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Website:</span>
                  <a
                    href={auditResult.overview.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <span>{auditResult.overview.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold">ASSETS & CONTACT</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Profile Image:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cover Banner:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contact Email:</span>
                    <span className="text-slate-300 font-mono truncate">{auditResult.overview.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Followers (Est.):</span>
                    <span className="font-bold text-white">{auditResult.overview.followersCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Content Quality (Requirement #6B) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  B. Content Quality & Format Variety
                </h3>
              </div>
              <DemoBadge label="DEMO ESTIMATES" size="sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Posting Consistency</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">
                    {auditResult.contentQuality.postingConsistency}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({auditResult.contentQuality.postingConsistencyScore}/100)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Regular weekly distribution</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Caption Quality</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">
                    {auditResult.contentQuality.captionQualityScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{auditResult.contentQuality.captionQualityNotes}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">CTA Usage Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-blue-400">
                    {auditResult.contentQuality.ctaUsageRate}%
                  </span>
                  <span className="text-xs text-slate-400">({auditResult.contentQuality.ctaUsageRating})</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Posts containing next steps</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Content Variety Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-emerald-400">
                    {auditResult.contentQuality.contentVarietyScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Healthy format mix</p>
              </div>
            </div>

            {/* Content format distribution bar */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Content Mix Distribution</span>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${auditResult.contentQuality.contentVarietyBreakdown.images}%` }}
                  className="bg-blue-500 h-full"
                  title={`Images: ${auditResult.contentQuality.contentVarietyBreakdown.images}%`}
                />
                <div
                  style={{ width: `${auditResult.contentQuality.contentVarietyBreakdown.videos}%` }}
                  className="bg-indigo-500 h-full"
                  title={`Videos: ${auditResult.contentQuality.contentVarietyBreakdown.videos}%`}
                />
                <div
                  style={{ width: `${auditResult.contentQuality.contentVarietyBreakdown.carousels}%` }}
                  className="bg-purple-500 h-full"
                  title={`Carousels: ${auditResult.contentQuality.contentVarietyBreakdown.carousels}%`}
                />
                <div
                  style={{ width: `${auditResult.contentQuality.contentVarietyBreakdown.links}%` }}
                  className="bg-amber-500 h-full"
                  title={`Links: ${auditResult.contentQuality.contentVarietyBreakdown.links}%`}
                />
                <div
                  style={{ width: `${auditResult.contentQuality.contentVarietyBreakdown.textOnly}%` }}
                  className="bg-slate-600 h-full"
                  title={`Text: ${auditResult.contentQuality.contentVarietyBreakdown.textOnly}%`}
                />
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Images ({auditResult.contentQuality.contentVarietyBreakdown.images}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Videos ({auditResult.contentQuality.contentVarietyBreakdown.videos}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Carousels ({auditResult.contentQuality.contentVarietyBreakdown.carousels}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Links ({auditResult.contentQuality.contentVarietyBreakdown.links}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section C: SEO / Discoverability (Requirement #6C) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  C. SEO & Search Discoverability
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Clarity Score: <b className="text-blue-400">{auditResult.seo.descriptionClarityScore}/100</b>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-slate-400 font-semibold block">PAGE NAME OPTIMIZATION</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 inline-block">
                  Rating: {auditResult.seo.pageNameOptimization}
                </span>
                <p className="text-slate-300 mt-1">{auditResult.seo.pageNameNotes}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-slate-400 font-semibold block">IDENTIFIED KEYWORDS</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {auditResult.seo.relevantKeywordsIdentified.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-slate-400 font-semibold block">CALL-TO-ACTION QUALITY</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 inline-block">
                  Level: {auditResult.seo.callToActionQuality}
                </span>
                <p className="text-slate-300 mt-1">{auditResult.seo.callToActionNotes}</p>
              </div>
            </div>
          </div>

          {/* Section D: Engagement Metrics (Requirement #6D) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  D. Engagement Benchmarks
                </h3>
              </div>
              <DemoBadge label="DEMO METRICS ONLY" size="sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Average Reactions</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {auditResult.engagement.avgReactions.toLocaleString()}
                  </span>
                  <DemoBadge label="DEMO" size="sm" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Per published post</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Average Comments</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {auditResult.engagement.avgComments.toLocaleString()}
                  </span>
                  <DemoBadge label="DEMO" size="sm" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Discussion response</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Average Shares</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {auditResult.engagement.avgShares.toLocaleString()}
                  </span>
                  <DemoBadge label="DEMO" size="sm" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Viral reach multiplier</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Engagement Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400">
                    {auditResult.engagement.engagementRate}%
                  </span>
                  <DemoBadge label="DEMO" size="sm" />
                </div>
                <span className="text-[10px] text-emerald-400/90 mt-1 block">Above median benchmark</span>
              </div>
            </div>
          </div>

          {/* Section E: Recommendations (Requirement #6E) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  E. Actionable Recommendations
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {auditResult.recommendations.length} Prioritized Steps
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {rec.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.priority === 'High'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          {rec.effort}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-1.5">{rec.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export / Print Preview Modal */}
      {auditResult && (
        <ReportPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={`Facebook Page Audit: ${auditResult.pageName}`}
          subtitle={`Page URL: ${auditResult.pageUrl}`}
          reportType="audit"
          isDemoData={auditResult.isDemoData}
        >
          <div className="space-y-6 text-sm">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-slate-500">OVERALL AUDIT SCORE</span>
                <p className="text-3xl font-extrabold text-blue-700">{auditResult.overallScore}/100</p>
                <p className="text-xs text-slate-600 mt-1">{auditResult.summary.headlineInsight}</p>
              </div>
              <DemoBadge label="DEMO SCORE" size="md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">Page Overview</h4>
                <p><b>Name:</b> {auditResult.overview.pageName}</p>
                <p><b>Category:</b> {auditResult.overview.category}</p>
                <p><b>Completeness:</b> {auditResult.overview.profileCompleteness}%</p>
                <p><b>Website:</b> {auditResult.overview.website}</p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">Content Quality Metrics (Demo)</h4>
                <p><b>Posting Consistency:</b> {auditResult.contentQuality.postingConsistency}</p>
                <p><b>CTA Usage Rate:</b> {auditResult.contentQuality.ctaUsageRate}%</p>
                <p><b>Avg Engagement:</b> {auditResult.engagement.engagementRate}%</p>
                <p><b>Reactions / Post:</b> {auditResult.engagement.avgReactions}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3">Key Recommendations</h4>
              <ul className="space-y-2">
                {auditResult.recommendations.map((r, i) => (
                  <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block text-xs">
                      [{r.category}] {r.title} ({r.priority} Priority)
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block">{r.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ReportPrintModal>
      )}
    </div>
  );
};
