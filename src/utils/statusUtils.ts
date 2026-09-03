import { MemberStatusConfig, StatusColor, DEFAULT_MEMBER_STATUSES } from '../types';

export interface StatusColorStyle {
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotBg: string;
  printColor: string;
  label: string;
}

export const STATUS_COLOR_OPTIONS: { color: StatusColor; label: string; previewClass: string }[] = [
  { color: 'emerald', label: 'Verde (Ativo)', previewClass: 'bg-emerald-500' },
  { color: 'amber', label: 'Âmbar (Observação)', previewClass: 'bg-amber-500' },
  { color: 'blue', label: 'Azul (Licença)', previewClass: 'bg-blue-500' },
  { color: 'purple', label: 'Roxo (Honorário)', previewClass: 'bg-purple-500' },
  { color: 'red', label: 'Vermelho (Afastado)', previewClass: 'bg-red-500' },
  { color: 'orange', label: 'Laranja (Próspero/Especial)', previewClass: 'bg-orange-500' },
  { color: 'cyan', label: 'Ciano (Transferido)', previewClass: 'bg-cyan-500' },
  { color: 'zinc', label: 'Cinza (Reserva/Outro)', previewClass: 'bg-zinc-400' }
];

export const STATUS_COLOR_MAP: Record<StatusColor, StatusColorStyle> = {
  emerald: {
    badgeBg: 'bg-emerald-950/70',
    badgeBorder: 'border-emerald-700/70',
    badgeText: 'text-emerald-400',
    dotBg: 'bg-emerald-400',
    printColor: '#166534',
    label: 'Verde Esmeralda'
  },
  amber: {
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-700/70',
    badgeText: 'text-amber-400',
    dotBg: 'bg-amber-400',
    printColor: '#b45309',
    label: 'Âmbar'
  },
  blue: {
    badgeBg: 'bg-blue-950/70',
    badgeBorder: 'border-blue-700/70',
    badgeText: 'text-blue-400',
    dotBg: 'bg-blue-400',
    printColor: '#1d4ed8',
    label: 'Azul'
  },
  purple: {
    badgeBg: 'bg-purple-950/70',
    badgeBorder: 'border-purple-700/70',
    badgeText: 'text-purple-400',
    dotBg: 'bg-purple-400',
    printColor: '#7e22ce',
    label: 'Roxo'
  },
  red: {
    badgeBg: 'bg-red-950/70',
    badgeBorder: 'border-red-700/70',
    badgeText: 'text-red-400',
    dotBg: 'bg-red-400',
    printColor: '#dc2626',
    label: 'Vermelho'
  },
  orange: {
    badgeBg: 'bg-orange-950/70',
    badgeBorder: 'border-orange-700/70',
    badgeText: 'text-orange-400',
    dotBg: 'bg-orange-400',
    printColor: '#c2410c',
    label: 'Laranja'
  },
  cyan: {
    badgeBg: 'bg-cyan-950/70',
    badgeBorder: 'border-cyan-700/70',
    badgeText: 'text-cyan-400',
    dotBg: 'bg-cyan-400',
    printColor: '#0e7490',
    label: 'Ciano'
  },
  zinc: {
    badgeBg: 'bg-zinc-800/80',
    badgeBorder: 'border-zinc-600/70',
    badgeText: 'text-zinc-300',
    dotBg: 'bg-zinc-400',
    printColor: '#4b5563',
    label: 'Cinza'
  }
};

/**
 * Returns the matching styling config for any status name
 */
export function getStatusStyle(statusName?: string, customStatuses?: MemberStatusConfig[]): StatusColorStyle {
  if (!statusName) return STATUS_COLOR_MAP.zinc;

  const normalized = statusName.trim().toLowerCase();

  // Check custom statuses list first
  if (customStatuses && customStatuses.length > 0) {
    const matched = customStatuses.find(s => s.name.trim().toLowerCase() === normalized);
    if (matched && STATUS_COLOR_MAP[matched.color]) {
      return STATUS_COLOR_MAP[matched.color];
    }
  }

  // Check default statuses
  const defaultMatched = DEFAULT_MEMBER_STATUSES.find(s => s.name.trim().toLowerCase() === normalized);
  if (defaultMatched && STATUS_COLOR_MAP[defaultMatched.color]) {
    return STATUS_COLOR_MAP[defaultMatched.color];
  }

  // Fallback heuristics based on common words
  if (normalized.includes('ativ') || normalized.includes('rodando')) return STATUS_COLOR_MAP.emerald;
  if (normalized.includes('observ') || normalized.includes('analis') || normalized.includes('pendent')) return STATUS_COLOR_MAP.amber;
  if (normalized.includes('licen') || normalized.includes('afast') || normalized.includes('suspens')) return STATUS_COLOR_MAP.red;
  if (normalized.includes('honor') || normalized.includes('merit')) return STATUS_COLOR_MAP.purple;
  if (normalized.includes('prosp') || normalized.includes('meio')) return STATUS_COLOR_MAP.orange;
  if (normalized.includes('transf') || normalized.includes('region')) return STATUS_COLOR_MAP.cyan;

  return STATUS_COLOR_MAP.zinc;
}
