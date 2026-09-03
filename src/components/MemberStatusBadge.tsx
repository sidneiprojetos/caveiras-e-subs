import React from 'react';
import { MemberStatusConfig } from '../types';
import { getStatusStyle } from '../utils/statusUtils';

interface MemberStatusBadgeProps {
  status: string;
  statuses?: MemberStatusConfig[];
  className?: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({
  status,
  statuses,
  className = '',
  showDot = true,
  size = 'md'
}) => {
  const style = getStatusStyle(status, statuses);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${style.badgeBg} ${style.badgeBorder} ${style.badgeText} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span className={`${dotSizes[size]} rounded-full ${style.dotBg} shrink-0 animate-pulse`} />
      )}
      <span className="truncate">{status}</span>
    </span>
  );
};
