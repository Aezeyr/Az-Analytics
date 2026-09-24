import React from 'react';
import { X, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProtectedGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
  featureTitle?: string;
  description?: string;
}

export const ProtectedGateModal: React.FC<ProtectedGateModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  featureTitle = 'Save and manage your own reports',
  description = 'Create a free account or sign in with Google to use your own data.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Header background accent */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-3 backdrop-blur-xs border border-white/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Unlock User Workspace</h3>
          <p className="text-xs text-blue-100 mt-1 max-w-xs mx-auto">
            {featureTitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="p-3.5 mb-5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-center">
            <p className="text-sm font-medium text-blue-900">
              {description}
            </p>
          </div>

          <ul className="space-y-2.5 mb-6 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Save unlimited Facebook Page audits & comparisons</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Export custom date-range performance reports (PDF & CSV)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Isolated Supabase database storage with Row-Level Security</span>
            </li>
          </ul>

          <div className="space-y-3">
            <button
              onClick={() => {
                onGoogleSignIn();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 ml-auto text-white/80" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Keep exploring in Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
