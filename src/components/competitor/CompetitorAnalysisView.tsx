import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Printer,
  Sparkles,
  TrendingUp,
  BarChart2,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { CompetitorAnalysisResult, UserProfile } from '../../types';
import { competitorService } from '../../services/competitorAnalysis/competitorService';
import { databaseService } from '../../services/database/databaseService';
import { DemoBadge } from '../common/DemoBadge';
import { ReportPrintModal } from '../common/ReportPrintModal';

interface CompetitorAnalysisViewProps {
  currentUser: UserProfile | null;
  onOpenProtectedGate: (title?: string) => void;
  isDemoMode: boolean;
}

export const CompetitorAnalysisView: React.FC<CompetitorAnalysisViewProps> = ({
  currentUser,
  onOpenProtectedGate,
  isDemoMode,
}) => {
  const [primaryUrl, setPrimaryUrl] = useState('https://www.facebook.com/demobusinesspage');
  const [competitorUrls, setCompetitorUrls] = useState<string[]>([
    'https://www.facebook.com/apextechcloud',
    'https://www.facebook.com/flowmatrix',
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysisResult | null>(() =>
    competitorService.getSampleDemoAnalysis()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleAddCompetitor = () => {
    if (competitorUrls.length >= 3) return;
    setCompetitorUrls([...competitorUrls, '']);
  };

  const handleRemoveCompetitor = (index: number) => {
    const updated = [...competitorUrls];
    updated.splice(index, 1);
    setCompetitorUrls(updated);
  };

  const handleUpdateCompetitor = (index: number, val: string) => {
    const updated = [...competitorUrls];
    updated[index] = val;
    setCompetitorUrls(updated);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    if (!primaryUrl.trim()) {
      setError('Please provide your primary Facebook Page URL.');
      return;
    }

    const validUrls = competitorUrls.filter((u) => u.trim().length > 0);
    if (validUrls.length === 0) {
      setError('Please add at least one competitor Facebook Page URL to compare.');
      return;
    }

    setLoading(true);
    setLoadingStep('Comparing page footprints...');

    try {
      setTimeout(() => setLoadingStep('Benchmarking posting frequency & engagement rates...'), 600);
      setTimeout(() => setLoadingStep('Analyzing content formats & strategic gaps...'), 1200);

      const result = await competitorService.analyzeCompetitors(
        primaryUrl,
        validUrls,
        !currentUser
      );
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err?.message || 'Competitor analysis could not be completed. Please check your URLs.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSaveToReports = async () => {
    if (!currentUser) {
      onOpenProtectedGate('Sign in with Google to save this competitor analysis to your user account.');
      return;
    }

    if (!analysisResult) return;

    try {
      await databaseService.saveReport({
        userId: currentUser.id,
        reportName: `Competitor Analysis: ${analysisResult.competitors[0]?.name || 'Primary'} vs ${analysisResult.competitors.length - 1} Rivals`,
        reportType: 'competitor',
        pageName: analysisResult.competitors[0]?.name || 'Primary Page',
        pageUrl: analysisResult.primaryPageUrl,
        status: 'Ready',
        data: analysisResult,
        isDemoData: analysisResult.isDemoData,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setError('Your competitor analysis could not be saved. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Competitor Analysis</h1>
              <DemoBadge label="DEMO BENCHMARKS" size="sm" />
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Benchmark your Facebook Page against up to 3 competitors across posting frequency, engagement, content mix, CTA patterns, and strategic gaps.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
            <span>Comparison Engine:</span>{' '}
            <span className="text-indigo-400 font-bold">Side-by-Side Matrix</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-6 space-y-4">
          {/* Primary page */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Primary Page URL (Your Page)</span>
              <span className="text-blue-400 text-[11px]">Primary Subject</span>
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                placeholder="https://www.facebook.com/yourbusiness"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Competitors inputs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Competitor Facebook Pages (Up to 3)
              </label>
              {competitorUrls.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Competitor ({competitorUrls.length}/3)</span>
                </button>
              )}
            </div>

            {competitorUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-500">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUpdateCompetitor(idx, e.target.value)}
                    placeholder={`Competitor ${idx + 1} URL (e.g. https://www.facebook.com/competitor${idx + 1})`}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {competitorUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitor(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Remove competitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Public metrics estimated for demo exploration.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Comparing...'}</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Analyze Competitors</span>
                </>
              )}
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
          <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="font-bold text-lg">{loadingStep}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extracting post timestamps, engagement ratios, and structural differences...
          </p>
        </div>
      )}

      {/* Analysis Results View */}
      {!loading && analysisResult && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                VS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-white">
                    {analysisResult.competitors[0]?.name} vs {analysisResult.competitors.length - 1} Competitors
                  </h2>
                  <DemoBadge label="DEMO COMPARISON" size="sm" />
                </div>
                <p className="text-xs text-slate-400">
                  Benchmarked across 8 key performance and content dimensions
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export / Print</span>
              </button>
            </div>
          </div>

          {/* Side-by-side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysisResult.competitors.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  item.isPrimary
                    ? 'bg-slate-900 border-blue-500/50 shadow-md shadow-blue-500/5'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.isPrimary
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.isPrimary ? 'Your Primary Page' : `Competitor #${idx}`}
                  </span>
                  <DemoBadge label="ESTIMATES" size="sm" />
                </div>

                <h3 className="font-bold text-base text-white truncate">{item.name}</h3>
                <span className="text-xs text-slate-400 block mb-4">{item.category}</span>

                {/* Key KPIs */}
                <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Followers:</span>
                    <span className="font-bold text-white">{item.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Weekly Cadence:</span>
                    <span className="font-bold text-indigo-400">{item.postingFrequencyWeekly}x / week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Avg Engagement Rate:</span>
                    <span className="font-bold text-emerald-400">{item.avgEngagementRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Top Content Type:</span>
                    <span className="text-white font-medium">{item.dominantContentType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Caption Style:</span>
                    <span className="text-slate-200">{item.captionStyle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">CTA Frequency:</span>
                    <span className="text-slate-200">{item.ctaUsage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table Requirement #7 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Detailed Feature & Strategy Comparison Table
                </h3>
              </div>
              <DemoBadge label="DEMO DATA" size="sm" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Evaluation Metric</th>
                    {analysisResult.competitors.map((c, i) => (
                      <th key={i} className="py-3 px-4">
                        {c.name} {c.isPrimary && '(Primary)'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Posting Frequency</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {c.postingFrequencyWeekly} posts/week
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Average Engagement</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {c.avgEngagementRate}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Average Reactions / Post</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.avgReactions}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Average Comments / Post</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono">
                        {c.avgComments}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Dominant Content Format</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-medium text-white">
                        {c.dominantContentType}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Caption Approach</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 text-slate-300">
                        {c.captionStyle}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Call-To-Action (CTA) Usage</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono">
                          {c.ctaUsage}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Hashtag Pattern</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 text-slate-400">
                        {c.hashtagStrategy}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">Consistency Score</td>
                    {analysisResult.competitors.map((c, i) => (
                      <td key={i} className="py-3 px-4 font-mono font-bold">
                        {c.consistencyScore}/100
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Competitor Insights Section (Requirement #7) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Key Competitor Insights & Tactical Takeaways
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Strategic Synthesis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Frequently used content themes */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Frequently Used Content Themes</span>
                </h4>
                <ul className="space-y-2 text-slate-300">
                  {analysisResult.keyInsights.frequentThemes.map((theme, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common CTA Patterns */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Common CTA Patterns</span>
                </h4>
                <ul className="space-y-2 text-slate-300">
                  {analysisResult.keyInsights.ctaPatterns.map((cta, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{cta}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Posting consistency comparison */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="font-bold text-sm text-slate-200">Posting Consistency Comparison</h4>
                <p className="text-slate-300 leading-relaxed">
                  {analysisResult.keyInsights.postingConsistencyComparison}
                </p>
              </div>

              {/* Content gaps to explore */}
              <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2">
                <h4 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Content Gaps to Explore</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  High-opportunity territory where rivals underperform:
                </p>
                <ul className="space-y-1.5 text-slate-300">
                  {analysisResult.keyInsights.contentGapsToExplore.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">→</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Respectful notice */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Note: Do not copy competitors' content directly. Use these observations to identify underserved questions and format advantages.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Export / Print Modal */}
      {analysisResult && (
        <ReportPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={`Competitor Analysis: ${analysisResult.competitors[0]?.name || 'Primary'}`}
          subtitle={`Compared with ${analysisResult.competitors.length - 1} Facebook Pages`}
          reportType="competitor"
          isDemoData={analysisResult.isDemoData}
        >
          <div className="space-y-6 text-sm">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-800 mb-2">Competitors Analyzed</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {analysisResult.competitors.map((c, i) => (
                  <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                    <p className="font-bold text-slate-900 truncate">{c.name}</p>
                    <p className="text-slate-500 font-mono">{c.followers.toLocaleString()} followers</p>
                    <p className="text-indigo-600 font-mono mt-1">{c.avgEngagementRate}% avg engagement</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Content Gaps & Strategic Recommendations</h4>
              <ul className="space-y-2 text-xs">
                {analysisResult.keyInsights.contentGapsToExplore.map((g, i) => (
                  <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    {g}
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
