import React from 'react';
import { Shield, Skull, Crosshair, Star, Award } from 'lucide-react';
import { DEFAULT_GRUPAMENTOS } from '../types';

interface GrupamentoBadgeProps {
  grupamento: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const GrupamentoBadge: React.FC<GrupamentoBadgeProps> = ({
  grupamento,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const meta = DEFAULT_GRUPAMENTOS.find(
    (g) => g.name.toLowerCase() === grupamento.toLowerCase()
  ) || {
    name: grupamento,
    color: 'text-zinc-300',
    badgeBg: 'bg-zinc-800/80 border-zinc-700 text-zinc-200',
    borderColor: 'border-zinc-500',
    iconType: 'shield'
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
    switch (meta.iconType) {
      case 'skull':
        return <Skull size={iconSize} className="text-red-400 shrink-0" />;
      case 'shield':
        return <Shield size={iconSize} className="text-amber-400 shrink-0" />;
      case 'crosshair':
        return <Crosshair size={iconSize} className="text-blue-400 shrink-0" />;
      case 'star':
        return <Star size={iconSize} className="text-purple-400 shrink-0 fill-purple-400/20" />;
      default:
        return <Award size={iconSize} className="text-zinc-400 shrink-0" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border backdrop-blur-sm transition-colors shadow-sm select-none ${meta.badgeBg} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && getIcon()}
      <span>{meta.name}</span>
    </span>
  );
};
