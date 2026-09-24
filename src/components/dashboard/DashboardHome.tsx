import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  BarChart3,
  BookmarkCheck,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileText,
  PlusCircle,
  ExternalLink,
  Activity,
  Layers,
} from 'lucide-react';
import { UserProfile, SavedReportRecord } from '../../types';
import { databaseService, DashboardStats, ActivityItem } from '../../services/database/databaseService';
import { DemoBadge } from '../common/DemoBadge';

interface DashboardHomeProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: string) => void;
  onOpenProtectedGate: (title?: string) => void;
  isDemoMode: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentUser,
  onNavigate,
  onOpenProtectedGate,
  isDemoMode,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAudits: 0,
    savedReports: 0,
    competitorsTracked: 0,
    lastAnalysisDate: null,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userId = currentUser ? currentUser.id : 'demo_guest_user';
      const statsData = await databaseService.getDashboardStats(userId);
      const activityData = await databaseService.getRecentActivities(userId);

      // In guest demo mode if no reports are saved yet, provide realistic sample activity
      if (statsData.savedReports === 0 && (!currentUser || currentUser.isDemoUser)) {
        setStats({
          totalAudits: 3,
          savedReports: 2,
          competitorsTracked: 3,
          lastAnalysisDate: new Date().toISOString(),
        });
        setRecentActivities([
          {
            id: 'act_1',
            type: 'audit',
            title: 'Audit: Demo Business Page',
            description: 'Completed comprehensive content & SEO audit (Score: 79/100)',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            pageName: 'Demo Business Page',
            isDemo: true,
          },
          {
            id: 'act_2',
            type: 'competitor',
            title: 'Competitor Benchmark: 3 Pages',
            description: 'Analyzed post frequency & engagement gaps vs ApexTech Cloud and FlowMatrix',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            pageName: 'ApexTech Cloud & Peers',
            isDemo: true,
          },
          {
            id: 'act_3',
            type: 'performance',
            title: '30-Day Performance Summary',
            description: 'Synthesized 15 posts; detected 4.45% peak video engagement',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            pageName: 'Demo Business Page',
            isDemo: true,
          },
        ]);
      } else {
        setStats(statsData);
        setRecentActivities(activityData);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const hasNoData = stats.totalAudits === 0 && stats.savedReports === 0 && recentActivities.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {currentUser ? `Welcome back, ${currentUser.fullName.split(' ')[0]}` : 'Analytics Dashboard'}
            </h1>
            {isDemoMode && <DemoBadge label="DEMO MODE" size="sm" />}
          </div>
          <p className="text-xs text-slate-400">
            Monitor Facebook Page performance, discover competitor gaps, and generate actionable reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('audit')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>New Page Audit</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Audits */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Audits</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{stats.totalAudits}</span>
            {isDemoMode && <DemoBadge label="DEMO" size="sm" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Verified audits</span> completed
          </p>
        </div>

        {/* Saved Reports */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Saved Reports</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{stats.savedReports}</span>
            {isDemoMode && <DemoBadge label="DEMO" size="sm" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Stored in user workspace
          </p>
        </div>

        {/* Competitors Tracked */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Competitors Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{stats.competitorsTracked}</span>
            {isDemoMode && <DemoBadge label="DEMO" size="sm" />}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Benchmark comparisons
          </p>
        </div>

        {/* Last Analysis */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Last Analysis</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white tracking-tight truncate">
              {stats.lastAnalysisDate
                ? new Date(stats.lastAnalysisDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'None yet'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.lastAnalysisDate ? 'Recent audit snapshot' : 'Run your first audit'}
          </p>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('audit')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">Facebook Page Audit</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Evaluate page completeness, SEO keyword targeting, posting consistency, and actionable improvements.
          </p>
          <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
            <span>Analyze a Page</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('competitor')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">Competitor Analysis</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Compare post cadence, engagement rates, CTA patterns, and discover content opportunities.
          </p>
          <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
            <span>Compare Competitors</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('performance')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">Performance Reports</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Generate custom date-range analytics over 7, 30, or 90 days with trend charts and exports.
          </p>
          <span className="text-xs font-semibold text-sky-400 group-hover:text-sky-300 flex items-center gap-1">
            <span>Generate Report</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* Recent Activity & Empty State */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-sm text-white">Recent Activity</h2>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-blue-400 hover:underline"
          >
            View All Reports
          </button>
        </div>

        {hasNoData ? (
          /* Empty State Requirement #5 */
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No analysis yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Start by auditing your Facebook Page to uncover content quality, SEO visibility, and recommendations.
            </p>
            <button
              onClick={() => onNavigate('audit')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              Start Page Audit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => onNavigate(act.type)}
                className="py-3.5 flex items-center justify-between hover:bg-slate-800/40 px-3 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      act.type === 'audit'
                        ? 'bg-blue-500/10 text-blue-400'
                        : act.type === 'competitor'
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'bg-sky-500/10 text-sky-400'
                    }`}
                  >
                    {act.type === 'audit' && <ShieldCheck className="w-4 h-4" />}
                    {act.type === 'competitor' && <Users className="w-4 h-4" />}
                    {act.type === 'performance' && <BarChart3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {act.title}
                      </span>
                      {act.isDemo && <DemoBadge label="DEMO" size="sm" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 font-mono hidden sm:block">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
