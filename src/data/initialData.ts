import { Divisao, Member, ActivityLog } from '../types';

export const INITIAL_DIVISOES: Divisao[] = [
  {
    id: 'div-umuarama-oeste',
    name: 'Umuarama Oeste',
    city: 'Umuarama',
    state: 'PR',
    regionalDirector: 'Caveira Sidnei',
    subDirector: 'Subdiretor Marreta',
    createdDate: '2021-03-15',
    active: true,
    meetingSchedule: 'Quintas-feiras às 20h',
    meetingLocation: 'Sede Regional Oeste - Av. Paraná',
    description: 'Divisão polo do Noroeste Paranaense cobrindo a região Oeste de Umuarama.'
  },
  {
    id: 'div-umuarama-leste',
    name: 'Umuarama Leste',
    city: 'Umuarama',
    state: 'PR',
    regionalDirector: 'Caveira Sidnei',
    subDirector: 'Subdiretor Falcão',
    createdDate: '2021-08-10',
    active: true,
    meetingSchedule: 'Quartas-feiras às 19h30',
    meetingLocation: 'Sede Regional Leste - Rod. PR-323',
    description: 'Divisão estratégica Leste com atuação intensiva na integração urbana e comboios.'
  },
  {
    id: 'div-cianorte',
    name: 'Cianorte',
    city: 'Cianorte',
    state: 'PR',
    regionalDirector: 'Operacional Machado',
    subDirector: 'Subdiretor Caveira Trovão',
    createdDate: '2022-01-20',
    active: true,
    meetingSchedule: 'Sextas-feiras às 20h',
    meetingLocation: 'Sede Cianorte - Centro',
    description: 'Divisão Capital do Vestuário com forte contingente operacional e comboios.'
  },
  {
    id: 'div-cidade-gaucha',
    name: 'Cidade Gaúcha',
    city: 'Cidade Gaúcha',
    state: 'PR',
    regionalDirector: 'Caveira Sidnei',
    subDirector: 'Subdiretor Lobo',
    createdDate: '2022-05-14',
    active: true,
    meetingSchedule: 'Sábados às 18h',
    meetingLocation: 'Ponto de Encontro Central',
    description: 'Divisão do corredor norte do Paraná com atuação regional em eventos beneficentes.'
  },
  {
    id: 'div-campo-mourao',
    name: 'Campo Mourão',
    city: 'Campo Mourão',
    state: 'PR',
    regionalDirector: 'Operacional Regional Brutus',
    subDirector: 'Subdiretor Caveira Hulk',
    createdDate: '2021-11-05',
    active: true,
    meetingSchedule: 'Quintas-feiras às 20h',
    meetingLocation: 'Sede Campo Mourão - Perimetral',
    description: 'Divisão de grande relevância rodoviária e conexão com o Centro-Oeste Paranaense.'
  },
  {
    id: 'div-goioere',
    name: 'Goioere',
    city: 'Goioerê',
    state: 'PR',
    regionalDirector: 'Operacional Regional Brutus',
    subDirector: 'Subdiretor Predador',
    createdDate: '2022-09-18',
    active: true,
    meetingSchedule: 'Terças-feiras às 19h30',
    meetingLocation: 'Ponto de Apoio Goioerê',
    description: 'Divisão em franca expansão com expressivo engajamento social e irmandade.'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    name: 'Sidnei Rodrigues Alves',
    vulgo: 'Caveira Sidnei',
    coleteNumber: 'IMC-0142',
    grupamento: 'Caveira',
    divisaoId: 'div-umuarama-oeste',
    divisaoName: 'Umuarama Oeste',
    status: 'Ativo',
    phone: '(44) 99874-1234',
    email: 'sidnei.insanos@gmail.com',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Mariana Alves',
      phone: '(44) 99123-5566',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Harley-Davidson',
      model: 'Fat Boy 114',
      engineCc: '1868cc',
      plate: 'IMC-1969',
      year: '2023'
    },
    entryDate: '2019-04-12',
    grupamentoGraduationDate: '2020-08-20',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    observations: 'Fundador da regional e coordenador de disciplina dos comboios.',
    createdAt: '2021-03-15T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-002',
    name: 'Carlos Eduardo Marcondes',
    vulgo: 'Subdiretor Marreta',
    coleteNumber: 'IMC-0288',
    grupamento: 'Subdiretor',
    divisaoId: 'div-umuarama-oeste',
    divisaoName: 'Umuarama Oeste',
    status: 'Ativo',
    phone: '(44) 99765-4321',
    email: 'marreta.imc@gmail.com',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Patrícia Marcondes',
      phone: '(44) 99988-7711',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Kawasaki',
      model: 'Versys 1000 GT',
      engineCc: '1043cc',
      plate: 'MRT-4422',
      year: '2022'
    },
    entryDate: '2020-02-10',
    grupamentoGraduationDate: '2021-06-15',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    observations: 'Subdiretoria executiva da Divisão Umuarama Oeste.',
    createdAt: '2021-03-15T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-003',
    name: 'Roberto Antunes da Silva',
    vulgo: 'Subdiretor Falcão',
    coleteNumber: 'IMC-0312',
    grupamento: 'Subdiretor',
    divisaoId: 'div-umuarama-leste',
    divisaoName: 'Umuarama Leste',
    status: 'Ativo',
    phone: '(44) 99812-7890',
    email: 'falcao.insanos@gmail.com',
    bloodType: 'B+',
    emergencyContact: {
      name: 'Carla Antunes',
      phone: '(44) 99877-3344',
      relationship: 'Irmã'
    },
    motorcycle: {
      brand: 'BMW',
      model: 'R 1250 GS Adventure',
      engineCc: '1254cc',
      plate: 'FLC-1250',
      year: '2023'
    },
    entryDate: '2020-07-14',
    grupamentoGraduationDate: '2021-11-20',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    observations: 'Responsável pela comunicação e logística da Divisão Leste.',
    createdAt: '2021-08-10T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-004',
    name: 'Marcio Henrique Machado',
    vulgo: 'Operacional Machado',
    coleteNumber: 'IMC-0199',
    grupamento: 'Operacional Regional',
    divisaoId: 'div-cianorte',
    divisaoName: 'Cianorte',
    status: 'Ativo',
    phone: '(44) 99155-6677',
    email: 'machado.op@gmail.com',
    bloodType: 'O-',
    emergencyContact: {
      name: 'Luciana Machado',
      phone: '(44) 99122-3344',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Triumph',
      model: 'Tiger 1200 Rally Pro',
      engineCc: '1160cc',
      plate: 'MCH-9988',
      year: '2023'
    },
    entryDate: '2019-11-03',
    grupamentoGraduationDate: '2021-02-18',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    observations: 'Coordenação de escolta e batedores para todo o eixo Cianorte/Maringá.',
    createdAt: '2022-01-20T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-005',
    name: 'Thiago Valério Peixoto',
    vulgo: 'Subdiretor Caveira Trovão',
    coleteNumber: 'IMC-0077',
    grupamento: 'Subdiretor / Caveira',
    divisaoId: 'div-cianorte',
    divisaoName: 'Cianorte',
    status: 'Ativo',
    phone: '(44) 99899-4455',
    email: 'trovao.caveira@gmail.com',
    bloodType: 'AB+',
    emergencyContact: {
      name: 'Sandra Peixoto',
      phone: '(44) 99933-2211',
      relationship: 'Mãe'
    },
    motorcycle: {
      brand: 'Harley-Davidson',
      model: 'Road Glide Special',
      engineCc: '1868cc',
      plate: 'TRV-7700',
      year: '2021'
    },
    entryDate: '2018-06-25',
    grupamentoGraduationDate: '2020-04-10',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    observations: 'Dupla graduação: Subdiretor e Caveira com alta autoridade de disciplina.',
    createdAt: '2022-01-20T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-006',
    name: 'José Valmir de Oliveira',
    vulgo: 'Subdiretor Lobo',
    coleteNumber: 'IMC-0405',
    grupamento: 'Subdiretor',
    divisaoId: 'div-cidade-gaucha',
    divisaoName: 'Cidade Gaúcha',
    status: 'Ativo',
    phone: '(44) 99744-8899',
    email: 'lobo.gaucha@gmail.com',
    bloodType: 'A-',
    emergencyContact: {
      name: 'Renata de Oliveira',
      phone: '(44) 99711-2233',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Yamaha',
      model: 'MT-09 Tracer',
      engineCc: '847cc',
      plate: 'LBO-4050',
      year: '2020'
    },
    entryDate: '2021-04-02',
    grupamentoGraduationDate: '2022-07-15',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    observations: 'Coordenação e recepção de comboios na divisa norte.',
    createdAt: '2022-05-14T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-007',
    name: 'Bruno César Toledo',
    vulgo: 'Operacional Regional Brutus',
    coleteNumber: 'IMC-0112',
    grupamento: 'Operacional Regional',
    divisaoId: 'div-campo-mourao',
    divisaoName: 'Campo Mourão',
    status: 'Ativo',
    phone: '(44) 99911-3322',
    email: 'brutus.op@gmail.com',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Fernanda Toledo',
      phone: '(44) 99888-4455',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Honda',
      model: 'Africa Twin Adventure Sports',
      engineCc: '1084cc',
      plate: 'BRT-1122',
      year: '2023'
    },
    entryDate: '2019-08-19',
    grupamentoGraduationDate: '2021-03-30',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    observations: 'Responsável pelo planejamento de rotas e segurança regional.',
    createdAt: '2021-11-05T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-008',
    name: 'Wellington Santana Silva',
    vulgo: 'Subdiretor Caveira Hulk',
    coleteNumber: 'IMC-0098',
    grupamento: 'Subdiretor / Caveira',
    divisaoId: 'div-campo-mourao',
    divisaoName: 'Campo Mourão',
    status: 'Ativo',
    phone: '(44) 99833-7766',
    email: 'hulk.caveira@gmail.com',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Beatriz Santana',
      phone: '(44) 99822-1100',
      relationship: 'Filha'
    },
    motorcycle: {
      brand: 'Suzuki',
      model: 'Boulevard M1500',
      engineCc: '1462cc',
      plate: 'HLK-0098',
      year: '2019'
    },
    entryDate: '2018-10-10',
    grupamentoGraduationDate: '2020-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    observations: 'Caveira histórico e subdiretor atuante na regional Centro-Oeste.',
    createdAt: '2021-11-05T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-009',
    name: 'Alexandre Magno Faria',
    vulgo: 'Subdiretor Predador',
    coleteNumber: 'IMC-0512',
    grupamento: 'Subdiretor',
    divisaoId: 'div-goioere',
    divisaoName: 'Goioere',
    status: 'Ativo',
    phone: '(44) 99722-6655',
    email: 'predador.goioere@gmail.com',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Gisele Faria',
      phone: '(44) 99733-1122',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Ducati',
      model: 'Multistrada V4 S',
      engineCc: '1158cc',
      plate: 'PRD-5120',
      year: '2022'
    },
    entryDate: '2021-09-05',
    grupamentoGraduationDate: '2022-10-12',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    observations: 'Liderança ativa na Divisão Goioerê e captação de novos membros.',
    createdAt: '2022-09-18T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  },
  {
    id: 'mem-010',
    name: 'Danilo Ramos Silveira',
    vulgo: 'Caveira Caveirão',
    coleteNumber: 'IMC-0033',
    grupamento: 'Caveira',
    divisaoId: 'div-umuarama-leste',
    divisaoName: 'Umuarama Leste',
    status: 'Ativo',
    phone: '(44) 99944-5566',
    email: 'danilo.caveira@gmail.com',
    bloodType: 'B-',
    emergencyContact: {
      name: 'Joana Silveira',
      phone: '(44) 99911-8877',
      relationship: 'Esposa'
    },
    motorcycle: {
      brand: 'Harley-Davidson',
      model: 'Heritage Classic',
      engineCc: '1746cc',
      plate: 'CVR-0033',
      year: '2020'
    },
    entryDate: '2017-05-18',
    grupamentoGraduationDate: '2019-02-14',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    observations: 'Membro com condecoração de honra e longa quilometragem nacional.',
    createdAt: '2021-08-10T10:00:00.000Z',
    updatedAt: '2024-01-10T14:30:00.000Z'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-01T10:15:00.000Z',
    adminName: 'Diretoria Regional',
    action: 'ACESSO',
    target: 'Sistema Insanos M.C.',
    details: 'Inicialização do banco de dados operacional dos grupamentos e divisões.'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-01T10:20:00.000Z',
    adminName: 'Administrador',
    action: 'CADASTRO',
    target: 'Grupamentos & Divisões',
    details: 'Cadastro oficial das divisões: Umuarama Oeste, Umuarama Leste, Cianorte, Cidade Gaúcha, Campo Mourão e Goioerê.'
  }
];

const STORAGE_KEYS = {
  DIVISOES: 'insanos_mc_divisoes_v1',
  MEMBERS: 'insanos_mc_members_v1',
  LOGS: 'insanos_mc_logs_v1',
  ADMIN_PIN: 'insanos_mc_admin_pin_v1',
  ADMIN_SESSION: 'insanos_mc_admin_session_v1',
};

export const getStoredDivisoes = (): Divisao[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIVISOES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading divisoes from localStorage', e);
  }
  saveStoredDivisoes(INITIAL_DIVISOES);
  return INITIAL_DIVISOES;
};

export const saveStoredDivisoes = (divisoes: Divisao[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIVISOES, JSON.stringify(divisoes));
  } catch (e) {
    console.error('Error saving divisoes', e);
  }
};

export const getStoredMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading members from localStorage', e);
  }
  saveStoredMembers(INITIAL_MEMBERS);
  return INITIAL_MEMBERS;
};

export const saveStoredMembers = (members: Member[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading logs', e);
  }
  return INITIAL_LOGS;
};

export const addActivityLog = (action: ActivityLog['action'], target: string, details: string, adminName: string = 'Administrador') => {
  const currentLogs = getStoredLogs();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    adminName,
    action,
    target,
    details
  };
  const updated = [newLog, ...currentLogs].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving activity log', e);
  }
  return updated;
};

export const getStoredAdminPin = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
    if (raw) return raw;
  } catch (e) {
    console.error(e);
  }
  return '1969'; // Default Insanos MC Admin PIN
};

export const saveStoredAdminPin = (pin: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
  } catch (e) {
    console.error(e);
  }
};
