import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  reportType: 'audit' | 'competitor' | 'performance';
  children: React.ReactNode;
  isDemoData?: boolean;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  reportType,
  children,
  isDemoData = true,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    // Generate simple readable CSV text
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        `"Report Title","${title}"\n"Report Type","${reportType.toUpperCase()}"\n"Generated At","${new Date().toISOString()}"\n"Data Type","${isDemoData ? 'DEMO DATA' : 'PRODUCTION'}"\n`
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute(
      'download',
      `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none">
        {/* Top Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              AZ
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Report Export & Print Preview</h3>
              <p className="text-xs text-slate-400">Ready for browser print or PDF saving</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg text-white transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div className="p-8 md:p-12 text-slate-900 bg-white min-h-[600px] print:p-6">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-black text-xl tracking-tight text-blue-700">AZ ANALYTICS</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
                  {reportType} REPORT
                </span>
                {isDemoData && <DemoBadge label="DEMO DATA REPORT" size="sm" />}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 font-mono space-y-0.5">
              <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p>Platform: Facebook Pages</p>
              <p>Status: Verified Preview</p>
            </div>
          </div>

          {/* Child content render */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Document Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 font-mono">
            <p>© {new Date().getFullYear()} AZ Analytics. All rights reserved.</p>
            <p>Cloudflare Pages & GitHub Ready Architecture</p>
          </div>
        </div>
      </div>
    </div>
  );
};
