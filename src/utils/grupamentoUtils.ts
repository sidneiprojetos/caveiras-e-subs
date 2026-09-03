import { GrupamentoConfig, GrupamentoColorTheme, GrupamentoIconType, DEFAULT_GRUPAMENTOS } from '../types';

export interface GrupamentoThemeOption {
  theme: GrupamentoColorTheme;
  label: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  dotClass: string;
  previewClass: string;
}

export const GRUPAMENTO_THEME_OPTIONS: GrupamentoThemeOption[] = [
  {
    theme: 'red',
    label: 'Vermelho Caveira',
    badgeBg: 'bg-red-950/70 border-red-800 text-red-300',
    borderColor: 'border-red-600',
    textColor: 'text-red-400',
    dotClass: 'bg-red-500',
    previewClass: 'bg-red-600'
  },
  {
    theme: 'amber',
    label: 'Âmbar / Dourado Subdiretoria',
    badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-300',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-400',
    dotClass: 'bg-amber-500',
    previewClass: 'bg-amber-500'
  },
  {
    theme: 'blue',
    label: 'Azul Operacional',
    badgeBg: 'bg-blue-950/70 border-blue-800 text-blue-300',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-400',
    dotClass: 'bg-blue-500',
    previewClass: 'bg-blue-500'
  },
  {
    theme: 'purple',
    label: 'Roxo Elite / Especial',
    badgeBg: 'bg-purple-950/70 border-purple-800 text-purple-300',
    borderColor: 'border-purple-600',
    textColor: 'text-purple-400',
    dotClass: 'bg-purple-500',
    previewClass: 'bg-purple-500'
  },
  {
    theme: 'emerald',
    label: 'Verde Tático',
    badgeBg: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
    borderColor: 'border-emerald-600',
    textColor: 'text-emerald-400',
    dotClass: 'bg-emerald-500',
    previewClass: 'bg-emerald-500'
  },
  {
    theme: 'cyan',
    label: 'Ciano Escolta',
    badgeBg: 'bg-cyan-950/70 border-cyan-800 text-cyan-300',
    borderColor: 'border-cyan-600',
    textColor: 'text-cyan-400',
    dotClass: 'bg-cyan-500',
    previewClass: 'bg-cyan-500'
  },
  {
    theme: 'orange',
    label: 'Laranja Batedor',
    badgeBg: 'bg-orange-950/70 border-orange-800 text-orange-300',
    borderColor: 'border-orange-600',
    textColor: 'text-orange-400',
    dotClass: 'bg-orange-500',
    previewClass: 'bg-orange-500'
  },
  {
    theme: 'zinc',
    label: 'Zinco / Prata',
    badgeBg: 'bg-zinc-800/80 border-zinc-700 text-zinc-300',
    borderColor: 'border-zinc-500',
    textColor: 'text-zinc-400',
    dotClass: 'bg-zinc-400',
    previewClass: 'bg-zinc-400'
  }
];

export interface GrupamentoIconOption {
  type: GrupamentoIconType;
  label: string;
  description: string;
}

export const GRUPAMENTO_ICON_OPTIONS: GrupamentoIconOption[] = [
  { type: 'skull', label: 'Caveira', description: 'Caveira de honra e alta graduação' },
  { type: 'shield', label: 'Escudo', description: 'Diretoria, liderança e proteção' },
  { type: 'star', label: 'Estrela', description: 'Patente especial ou mista' },
  { type: 'crosshair', label: 'Mira Tática', description: 'Operacional e apoio tático' },
  { type: 'award', label: 'Insígnia', description: 'Condecoração e mérito' },
  { type: 'zap', label: 'Raio', description: 'Ação rápida, batedores e resposta' },
  { type: 'flame', label: 'Chama', description: 'Força, motor e comboio' },
  { type: 'flag', label: 'Bandeira', description: 'Representação regional' }
];

export const getGrupamentoConfig = (
  name: string,
  customList?: GrupamentoConfig[]
): GrupamentoConfig => {
  const allList = customList && customList.length > 0 ? customList : DEFAULT_GRUPAMENTOS;
  const found = allList.find(g => g.name.toLowerCase().trim() === name.toLowerCase().trim());
  if (found) {
    // If found has missing theme fields, infer them
    const themeOpt = GRUPAMENTO_THEME_OPTIONS.find(t => t.theme === found.colorTheme) || GRUPAMENTO_THEME_OPTIONS[0];
    return {
      ...found,
      badgeBg: found.badgeBg || themeOpt.badgeBg,
      borderColor: found.borderColor || themeOpt.borderColor,
      color: found.color || themeOpt.textColor
    };
  }

  // Fallback for unknown grupamento
  return {
    id: `unknown-${name}`,
    name,
    description: 'Grupamento / Patente Operacional',
    colorTheme: 'zinc',
    color: 'text-zinc-300',
    badgeBg: 'bg-zinc-800/80 border-zinc-700 text-zinc-200',
    borderColor: 'border-zinc-500',
    iconType: 'shield',
    active: true
  };
};
