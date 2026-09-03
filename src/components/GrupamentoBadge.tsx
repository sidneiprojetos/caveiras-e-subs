import React from 'react';
import { Shield, Skull, Crosshair, Star, Award, Zap, Flame, Flag } from 'lucide-react';
import { GrupamentoConfig } from '../types';
import { getGrupamentoConfig } from '../utils/grupamentoUtils';

interface GrupamentoBadgeProps {
  grupamento: string;
  grupamentos?: GrupamentoConfig[];
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const GrupamentoBadge: React.FC<GrupamentoBadgeProps> = ({
  grupamento,
  grupamentos,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const meta = getGrupamentoConfig(grupamento, grupamentos);

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    const iconColor = meta.color || 'text-zinc-300';
    switch (meta.iconType) {
      case 'skull':
        return <Skull size={iconSize} className="text-red-400 shrink-0" />;
      case 'shield':
        return <Shield size={iconSize} className="text-amber-400 shrink-0" />;
      case 'crosshair':
        return <Crosshair size={iconSize} className="text-blue-400 shrink-0" />;
      case 'star':
        return <Star size={iconSize} className="text-purple-400 shrink-0 fill-purple-400/20" />;
      case 'zap':
        return <Zap size={iconSize} className="text-amber-400 shrink-0 fill-amber-400/20" />;
      case 'flame':
        return <Flame size={iconSize} className="text-orange-400 shrink-0 fill-orange-400/20" />;
      case 'flag':
        return <Flag size={iconSize} className="text-emerald-400 shrink-0" />;
      default:
        return <Award size={iconSize} className={`${iconColor} shrink-0`} />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border backdrop-blur-sm transition-colors shadow-sm select-none ${meta.badgeBg || 'bg-zinc-800/80 border-zinc-700 text-zinc-200'} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && getIcon()}
      <span>{meta.name}</span>
    </span>
  );
};

