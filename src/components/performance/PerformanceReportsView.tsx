import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Bookmark,
  Printer,
  Sparkles,
  TrendingUp,
  Download,
  Check,
  AlertTriangle,
  Play,
  Layers,
  ArrowUpRight,
  Filter,
  Loader2,
} from 'lucide-react';
import { PerformanceReportResult, UserProfile } from '../../types';
import { performanceReportService } from '../../services/performanceReports/performanceReportService';
import { databaseService } from '../../services/database/databaseService';
import { DemoBadge } from '../common/DemoBadge';
import { ReportPrintModal } from '../common/ReportPrintModal';

interface PerformanceReportsViewProps {
  currentUser: UserProfile | null;
  onOpenProtectedGate: (title?: string) => void;
  isDemoMode: boolean;
}

export const PerformanceReportsView: React.FC<PerformanceReportsViewProps> = ({
  currentUser,
  onOpenProtectedGate,
  isDemoMode,
}) => {
  const [rangePreset, setRangePreset] = useState<'7 Days' | '30 Days' | '90 Days' | 'Custom'>('30 Days');
  const [pageUrl, setPageUrl] = useState('https://www.facebook.com/demobusinesspage');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [report, setReport] = useState<PerformanceReportResult | null>(() =>
    performanceReportService.getSampleDemoReport()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    setLoading(true);
    setLoadingStep('Aggregating date-range posts...');

    try {
      setTimeout(() => setLoadingStep('Calculating engagement curves & rates...'), 500);
      setTimeout(() => setLoadingStep('Generating content format distribution...'), 900);

      const res = await performanceReportService.generateReport(
        pageUrl,
        rangePreset,
        rangePreset === 'Custom' ? startDate : undefined,
        rangePreset === 'Custom' ? endDate : undefined,
        !currentUser
      );
      setReport(res);
    } catch (err: any) {
      setError(err?.message || 'Unable to generate report.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handlePresetChange = (preset: '7 Days' | '30 Days' | '90 Days' | 'Custom') => {
    setRangePreset(preset);
    const today = new Date();
    let days = 30;
    if (preset === '7 Days') days = 7;
    if (preset === '90 Days') days = 90;
    if (preset !== 'Custom') {
      const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  const handleSaveReport = async () => {
    if (!currentUser) {
      onOpenProtectedGate('Sign in with Google to save this date-range performance report to your account.');
      return;
    }

    if (!report) return;

    try {
      await databaseService.saveReport({
        userId: currentUser.id,
        reportName: report.reportName,
        reportType: 'performance',
        dateRange: `${report.startDate} to ${report.endDate}`,
        pageName: report.pageName,
        pageUrl: report.pageUrl,
        status: 'Ready',
        data: report,
        isDemoData: report.isDemoData,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setError('Could not save report. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Performance Reports</h1>
              <DemoBadge label="DATE RANGE DEMO" size="sm" />
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Generate date-range performance reports covering post counts, reaction velocity, format distribution, and high-impact content.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
            <span>Range Engine:</span>{' '}
            <span className="text-sky-400 font-bold">{rangePreset} Filter</span>
          </div>
        </div>

        {/* Date Selector Form */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Timeframe Presets:</span>
            {(['7 Days', '30 Days', '90 Days', 'Custom'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  rangePreset === preset
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                disabled={rangePreset !== 'Custom'}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                disabled={rangePreset !== 'Custom'}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white disabled:opacity-60"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{loadingStep || 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
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
          <div className="w-12 h-12 rounded-full border-3 border-sky-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="font-bold text-lg">{loadingStep}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Calculating time-series trends and synthesizing performance metrics...
          </p>
        </div>
      )}

      {/* Report Dashboard View */}
      {!loading && report && (
        <div className="space-y-6">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">{report.reportName}</h2>
                <DemoBadge label="DEMO METRICS" size="sm" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {report.startDate} — {report.endDate} • {report.summary.postingFrequency}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveReport}
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export / Print</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards Requirement #8 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Posts
              </span>
              <span className="text-2xl font-black text-white">{report.summary.totalPosts}</span>
              <span className="text-[10px] text-slate-500 block mt-1">In this window</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Engagement
              </span>
              <span className="text-2xl font-black text-emerald-400">{report.summary.avgEngagementRate}%</span>
              <span className="text-[10px] text-emerald-400/80 block mt-1">Benchmark baseline</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Reactions
              </span>
              <span className="text-2xl font-black text-white">{report.summary.avgReactions}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Per published post</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Comments
              </span>
              <span className="text-2xl font-black text-white">{report.summary.avgComments}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Discussion replies</span>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl col-span-2 lg:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Shares
              </span>
              <span className="text-2xl font-black text-sky-400">{report.summary.avgShares}</span>
              <span className="text-[10px] text-sky-400/80 block mt-1">Organic amplifications</span>
            </div>
          </div>

          {/* Charts Row Requirement #8: Engagement Trend + Posts over time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Engagement Over Time */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Engagement Rate Trend Over Time</h3>
                  <p className="text-[11px] text-slate-400">Daily average response rate (%)</p>
                </div>
                <DemoBadge label="DEMO TREND" size="sm" />
              </div>

              {/* Responsive SVG Chart */}
              <div className="h-44 w-full flex items-end gap-1.5 pt-4 border-b border-slate-800">
                {report.engagementTrend.map((pt, idx) => {
                  const heightPercent = Math.min(100, Math.max(15, (pt.rate / 5.5) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                        {pt.date}: {pt.rate}% ({pt.reactions} rx, {pt.comments} cm)
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-sm group-hover:from-sky-500 group-hover:to-sky-300 transition-all"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{report.engagementTrend[0]?.date || 'Start'}</span>
                <span>{report.engagementTrend[Math.floor(report.engagementTrend.length / 2)]?.date}</span>
                <span>{report.engagementTrend[report.engagementTrend.length - 1]?.date || 'End'}</span>
              </div>
            </div>

            {/* Chart 2: Posts Over Time */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Posting Cadence & Volume</h3>
                  <p className="text-[11px] text-slate-400">Post volume across selected timeline</p>
                </div>
                <DemoBadge label="DEMO POSTS" size="sm" />
              </div>

              <div className="h-44 w-full flex items-end gap-2 pt-4 border-b border-slate-800">
                {report.postsOverTime.map((pt, idx) => {
                  const barH = Math.max(12, (pt.posts / 5) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
                        {pt.posts} posts
                      </div>
                      <div
                        style={{ height: `${barH}%` }}
                        className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-sm group-hover:brightness-110 transition-all"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                {report.postsOverTime.map((p, i) => (
                  <span key={i}>{p.date}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Content Type Distribution Requirement #8 */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Content Type Breakdown & Relative Engagement
                </h3>
                <p className="text-xs text-slate-400">
                  Comparison of post volume and performance across formats
                </p>
              </div>
              <DemoBadge label="DEMO DATA" size="sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.contentTypeDistribution.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">{item.type}</span>
                    <span className="text-xs font-mono text-sky-400 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="bg-sky-500 h-full rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Count: {item.count}</span>
                    <span>Avg Rate: <b className="text-emerald-400">{item.avgEngagementRate}%</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Best Performing Content Requirement #8 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Best Performing Content in Period
                </h3>
                <p className="text-xs text-slate-400">Top posts ranked by audience reaction velocity</p>
              </div>
              <DemoBadge label="SAMPLE POSTS" size="sm" />
            </div>

            <div className="divide-y divide-slate-800">
              {report.bestPerformingPosts.map((post, i) => (
                <div key={post.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      #{i + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {post.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                        {post.ctaPresent && (
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            CTA Included
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-2 max-w-xl">
                        "{post.captionSnippet}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-9 md:pl-0">
                    <div className="text-center">
                      <span className="block font-bold text-white">{post.reactions}</span>
                      <span className="text-[10px] text-slate-500">Reactions</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-white">{post.comments}</span>
                      <span className="text-[10px] text-slate-500">Comments</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-white">{post.shares}</span>
                      <span className="text-[10px] text-slate-500">Shares</span>
                    </div>
                    <div className="text-center pl-2 border-l border-slate-800">
                      <span className="block font-bold text-emerald-400">{post.engagementRate}%</span>
                      <span className="text-[10px] text-emerald-400/80">Rate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recommendations Requirement #8 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                Period Recommendations & Next Steps
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
                  <span className="text-sky-400 font-bold">0{i + 1}.</span>
                  <p className="text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export / Print Preview Modal */}
      {report && (
        <ReportPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title={report.reportName}
          subtitle={`Window: ${report.startDate} to ${report.endDate}`}
          reportType="performance"
          isDemoData={report.isDemoData}
        >
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Total Posts:</span>
                <span className="text-lg font-bold">{report.summary.totalPosts}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Avg Engagement:</span>
                <span className="text-lg font-bold text-blue-600">{report.summary.avgEngagementRate}%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Avg Reactions:</span>
                <span className="text-lg font-bold">{report.summary.avgReactions}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Avg Shares:</span>
                <span className="text-lg font-bold">{report.summary.avgShares}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Recommendations</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    • {r}
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
