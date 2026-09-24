import React, { useEffect, useState } from 'react';
import {
  BookmarkCheck,
  Search,
  Trash2,
  Eye,
  FileText,
  ShieldCheck,
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  X,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import { SavedReportRecord, UserProfile } from '../../types';
import { databaseService } from '../../services/database/databaseService';
import { DemoBadge } from '../common/DemoBadge';
import { ReportPrintModal } from '../common/ReportPrintModal';

interface SavedReportsViewProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: string) => void;
  onOpenProtectedGate: (title?: string) => void;
  isDemoMode: boolean;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  currentUser,
  onNavigate,
  onOpenProtectedGate,
  isDemoMode,
}) => {
  const [reports, setReports] = useState<SavedReportRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'audit' | 'competitor' | 'performance'>('all');
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<SavedReportRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [currentUser]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const userId = currentUser ? currentUser.id : 'demo_guest_user';
      let data = await databaseService.getSavedReports(userId);

      // If user has no reports and is in demo mode, provide realistic sample saved reports
      if (data.length === 0 && (!currentUser || currentUser.isDemoUser)) {
        const sampleReports: SavedReportRecord[] = [
          {
            id: 'rep_sample_01',
            userId: 'demo_guest_user',
            reportName: 'Page Audit: Demo Business Page',
            reportType: 'audit',
            dateCreated: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            pageName: 'Demo Business Page',
            pageUrl: 'https://www.facebook.com/demobusinesspage',
            status: 'Ready',
            isDemoData: true,
            data: {
              overallScore: 76,
              summary: 'Healthy operational baseline; video formats will accelerate reach.',
            } as any,
          },
          {
            id: 'rep_sample_02',
            userId: 'demo_guest_user',
            reportName: 'Competitor Benchmark: ApexTech Cloud & FlowMatrix',
            reportType: 'competitor',
            dateCreated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            pageName: 'Demo Business Page vs Competitors',
            pageUrl: 'https://www.facebook.com/demobusinesspage',
            status: 'Ready',
            isDemoData: true,
            data: {
              competitorsCount: 3,
            } as any,
          },
          {
            id: 'rep_sample_03',
            userId: 'demo_guest_user',
            reportName: 'Performance Report: 30 Days (Demo Business Page)',
            reportType: 'performance',
            dateCreated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            dateRange: 'Past 30 Days',
            pageName: 'Demo Business Page',
            pageUrl: 'https://www.facebook.com/demobusinesspage',
            status: 'Ready',
            isDemoData: true,
            data: {
              totalPosts: 15,
              avgEngagementRate: 3.18,
            } as any,
          },
        ];
        setReports(sampleReports);
      } else {
        setReports(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!currentUser) {
      onOpenProtectedGate('Sign in with Google to manage your permanent saved reports.');
      return;
    }

    try {
      await databaseService.deleteReport(currentUser.id, reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setDeletingId(null);
    } catch {
      // Ignore
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || r.reportType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Saved Reports</h1>
              {isDemoMode && <DemoBadge label="SAVED IN WORKSPACE" size="sm" />}
            </div>
            <p className="text-xs text-slate-400">
              Access your historical page audits, competitor benchmarks, and date-range performance summaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('audit')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              + New Audit
            </button>
            <button
              onClick={() => onNavigate('performance')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              + New Report
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by name or page..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'audit', 'competitor', 'performance'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  typeFilter === filter
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {filter === 'all' ? 'All Types' : `${filter}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table / List (Requirement #9) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-white">
        {filteredReports.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-1">No reports found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {searchQuery
                ? 'No saved records match your current search query.'
                : 'You have not saved any analysis reports yet. Run an audit or generate a performance report to save it.'}
            </p>
            <button
              onClick={() => onNavigate('audit')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
            >
              Start Page Audit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-4">Report Type</th>
                  <th className="py-3 px-4">Page</th>
                  <th className="py-3 px-4">Date Range / Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Report Name */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {item.reportType === 'audit' && (
                          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        {item.reportType === 'competitor' && (
                          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                        {item.reportType === 'performance' && (
                          <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                        <span className="truncate max-w-xs">{item.reportName}</span>
                        {item.isDemoData && <DemoBadge label="DEMO" size="sm" />}
                      </div>
                    </td>

                    {/* Report Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.reportType === 'audit'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : item.reportType === 'competitor'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {item.reportType}
                      </span>
                    </td>

                    {/* Page */}
                    <td className="py-3.5 px-4 text-slate-300">{item.pageName}</td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.dateRange || new Date(item.dateCreated).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item.status}
                      </span>
                    </td>

                    {/* Actions: View & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingReport(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Report"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Quick View Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  {viewingReport.reportType} REPORT
                </span>
                <h3 className="font-bold text-base text-white">{viewingReport.reportName}</h3>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Associated Page:</span>
                <span className="font-semibold text-white">{viewingReport.pageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Page URL:</span>
                <span className="font-mono text-slate-300 truncate max-w-xs">{viewingReport.pageUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Date Created:</span>
                <span className="font-mono">{new Date(viewingReport.dateCreated).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Data Source:</span>
                <DemoBadge label={viewingReport.isDemoData ? 'DEMO METRICS' : 'PRODUCTION'} size="sm" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setViewingReport(null);
                  onNavigate(viewingReport.reportType);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open in Live Module</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
