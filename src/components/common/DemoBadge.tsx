import React from 'react';
import { Info } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'DEMO DATA',
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full select-none ${sizeClasses[size]}`}
      title="This metric represents sample demonstration data. Live Facebook metrics require a connected Facebook Page and Meta Graph API."
    >
      <Info className="w-3 h-3 text-amber-500 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
