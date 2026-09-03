export type GrupamentoIconType = 'skull' | 'shield' | 'star' | 'crosshair' | 'award' | 'zap' | 'flame' | 'flag';
export type GrupamentoColorTheme = 'red' | 'amber' | 'blue' | 'purple' | 'emerald' | 'cyan' | 'orange' | 'zinc';

export interface GrupamentoConfig {
  id: string;
  name: string;
  description?: string;
  colorTheme?: GrupamentoColorTheme;
  iconType: GrupamentoIconType;
  color?: string;
  badgeBg?: string;
  borderColor?: string;
  isDefault?: boolean;
  active: boolean;
  createdAt?: string;
}

export type GrupamentoName = string;

export const DEFAULT_GRUPAMENTOS: GrupamentoConfig[] = [
  {
    id: 'grup-caveira',
    name: 'Caveira',
    description: 'Grupamento de elite e alta graduação do moto clube',
    colorTheme: 'red',
    color: 'text-red-400',
    badgeBg: 'bg-red-950/70 border-red-800 text-red-300',
    borderColor: 'border-red-600',
    iconType: 'skull',
    isDefault: true,
    active: true
  },
  {
    id: 'grup-subdiretor',
    name: 'Subdiretor',
    description: 'Liderança executiva e coordenação de divisões',
    colorTheme: 'amber',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-300',
    borderColor: 'border-amber-600',
    iconType: 'shield',
    isDefault: true,
    active: true
  },
  {
    id: 'grup-operacional-regional',
    name: 'Operacional Regional',
    description: 'Coordenação tática e escolta em eventos e comboios regionais',
    colorTheme: 'blue',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/70 border-blue-800 text-blue-300',
    borderColor: 'border-blue-600',
    iconType: 'crosshair',
    isDefault: true,
    active: true
  },
  {
    id: 'grup-subdiretor-caveira',
    name: 'Subdiretor / Caveira',
    description: 'Graduação mista com prerrogativas de Subdiretoria e Caveira',
    colorTheme: 'purple',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/70 border-purple-800 text-purple-300',
    borderColor: 'border-purple-600',
    iconType: 'star',
    isDefault: true,
    active: true
  }
];

export interface Divisao {
  id: string;
  name: string;
  city: string;
  state: string;
  regionalDirector?: string;
  subDirector?: string;
  createdDate: string;
  active: boolean;
  meetingSchedule?: string;
  meetingLocation?: string;
  description?: string;
}

export type StatusColor = 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'orange' | 'cyan' | 'zinc';

export interface MemberStatusConfig {
  id: string;
  name: string;
  description?: string;
  color: StatusColor;
  isDefault?: boolean;
  active: boolean;
  createdAt?: string;
}

export const DEFAULT_MEMBER_STATUSES: MemberStatusConfig[] = [
  {
    id: 'status-ativo',
    name: 'Ativo',
    description: 'Integrante ativo, rodando e frequente nas reuniões e comboios',
    color: 'emerald',
    isDefault: true,
    active: true
  },
  {
    id: 'status-em-observacao',
    name: 'Em Observação',
    description: 'Integrante em período de observação ou avaliação tática',
    color: 'amber',
    isDefault: true,
    active: true
  },
  {
    id: 'status-licenca',
    name: 'Licença',
    description: 'Afastamento temporário acordado com a diretoria',
    color: 'blue',
    isDefault: true,
    active: true
  },
  {
    id: 'status-honorario',
    name: 'Honorário',
    description: 'Membro com honraria especial concedida pelo moto clube',
    color: 'purple',
    isDefault: true,
    active: true
  }
];

export type MemberStatus = string;

export interface Member {
  id: string;
  name: string;
  vulgo: string; // Nome de Colete / Apelido Operacional
  coleteNumber?: string; // Campo legado mantido para compatibilidade
  grupamento: string; // 'Caveira' | 'Subdiretor' | 'Operacional Regional' | 'Subdiretor / Caveira' | etc.
  divisaoId: string;
  divisaoName: string;
  status: MemberStatus;
  phone: string;
  email?: string;
  entryDate: string; // Data de entrada no MC
  grupamentoGraduationDate?: string; // Data de formação no grupamento
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: 'CADASTRO' | 'EDICAO' | 'EXCLUSAO' | 'ACESSO' | 'DIVISAO';
  target: string;
  details: string;
}

export interface FilterState {
  search: string;
  divisaoId: string;
  grupamento: string;
  status: string;
  sortBy: 'vulgo' | 'name' | 'entryDate' | 'divisaoName';
  sortOrder: 'asc' | 'desc';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERADOR';
  status: 'active' | 'suspended';
  permissions: string[];
  grantedAt: string;
  lastLogin?: string;
}

