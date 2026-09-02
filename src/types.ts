export type GrupamentoName = 
  | 'Caveira'
  | 'Subdiretor'
  | 'Operacional Regional'
  | 'Subdiretor / Caveira';

export const DEFAULT_GRUPAMENTOS: { name: string; description: string; color: string; badgeBg: string; borderColor: string; iconType: 'skull' | 'shield' | 'star' | 'crosshair' }[] = [
  {
    name: 'Caveira',
    description: 'Grupamento de elite e alta graduação do moto clube',
    color: 'text-red-400',
    badgeBg: 'bg-red-950/70 border-red-800 text-red-300',
    borderColor: 'border-red-600',
    iconType: 'skull'
  },
  {
    name: 'Subdiretor',
    description: 'Liderança executiva e coordenação de divisões',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/70 border-amber-800 text-amber-300',
    borderColor: 'border-amber-600',
    iconType: 'shield'
  },
  {
    name: 'Operacional Regional',
    description: 'Coordenação tática e escolta em eventos e comboios regionais',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/70 border-blue-800 text-blue-300',
    borderColor: 'border-blue-600',
    iconType: 'crosshair'
  },
  {
    name: 'Subdiretor / Caveira',
    description: 'Graduação mista com prerrogativas de Subdiretoria e Caveira',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/70 border-purple-800 text-purple-300',
    borderColor: 'border-purple-600',
    iconType: 'star'
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

export type MemberStatus = 'Ativo' | 'Em Observação' | 'Licença' | 'Honorário';

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

