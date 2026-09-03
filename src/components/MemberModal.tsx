import React, { useState, useEffect } from 'react';
import { 
  Member, Divisao, MemberStatus, DEFAULT_GRUPAMENTOS, 
  MemberStatusConfig, DEFAULT_MEMBER_STATUSES, StatusColor,
  GrupamentoConfig, GrupamentoColorTheme, GrupamentoIconType
} from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';
import { MemberStatusBadge } from './MemberStatusBadge';
import { STATUS_COLOR_OPTIONS } from '../utils/statusUtils';
import { GRUPAMENTO_THEME_OPTIONS, GRUPAMENTO_ICON_OPTIONS } from '../utils/grupamentoUtils';
import { getTodayDateString } from '../utils/dateUtils';
import { 
  X as CloseIcon, 
  User as UserIcon, 
  Shield as ShieldIcon, 
  Check as CheckIcon, 
  AlertTriangle as AlertIcon,
  ArrowRight,
  ArrowLeft,
  Plus,
  Tag,
  Settings2,
  Award,
  Sparkles
} from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  memberToEdit?: Member | null;
  divisoes: Divisao[];
  statuses?: MemberStatusConfig[];
  onOpenStatusManager?: () => void;
  onSaveStatus?: (status: MemberStatusConfig) => Promise<void> | void;
  grupamentos?: GrupamentoConfig[];
  onOpenGrupamentoManager?: () => void;
  onSaveGrupamento?: (grupamento: GrupamentoConfig) => Promise<void> | void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
  divisoes,
  statuses,
  onOpenStatusManager,
  onSaveStatus,
  grupamentos,
  onOpenGrupamentoManager,
  onSaveGrupamento
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'grupamento'>('geral');
  
  const [name, setName] = useState('');
  const [vulgo, setVulgo] = useState('');
  const [grupamento, setGrupamento] = useState<string>('Caveira');
  const [customGrupamento, setCustomGrupamento] = useState('');
  const [divisaoId, setDivisaoId] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Ativo');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [entryDate, setEntryDate] = useState(getTodayDateString());
  const [graduationDate, setGraduationDate] = useState('');
  const [observations, setObservations] = useState('');

  const [formError, setFormError] = useState('');

  // Quick Inline Status Creator state
  const [showQuickStatusForm, setShowQuickStatusForm] = useState(false);
  const [quickStatusName, setQuickStatusName] = useState('');
  const [quickStatusColor, setQuickStatusColor] = useState<StatusColor>('emerald');
  const [quickStatusError, setQuickStatusError] = useState('');
  const [isSavingQuickStatus, setIsSavingQuickStatus] = useState(false);

  // Quick Inline Grupamento Creator state
  const [showQuickGrupamentoForm, setShowQuickGrupamentoForm] = useState(false);
  const [quickGrupamentoName, setQuickGrupamentoName] = useState('');
  const [quickGrupamentoDesc, setQuickGrupamentoDesc] = useState('');
  const [quickGrupamentoTheme, setQuickGrupamentoTheme] = useState<GrupamentoColorTheme>('red');
  const [quickGrupamentoIcon, setQuickGrupamentoIcon] = useState<GrupamentoIconType>('shield');
  const [quickGrupamentoError, setQuickGrupamentoError] = useState('');
  const [isSavingQuickGrupamento, setIsSavingQuickGrupamento] = useState(false);

  const activeStatusesList = statuses && statuses.length > 0 ? statuses : DEFAULT_MEMBER_STATUSES;
  const availableGrupamentos = grupamentos && grupamentos.length > 0 ? grupamentos : DEFAULT_GRUPAMENTOS;

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setVulgo(memberToEdit.vulgo || '');
      
      const isKnown = availableGrupamentos.some(
        g => g.name.toLowerCase() === memberToEdit.grupamento.toLowerCase()
      );
      if (isKnown) {
        const matched = availableGrupamentos.find(
          g => g.name.toLowerCase() === memberToEdit.grupamento.toLowerCase()
        );
        setGrupamento(matched ? matched.name : memberToEdit.grupamento);
        setCustomGrupamento('');
      } else {
        setGrupamento('Outro');
        setCustomGrupamento(memberToEdit.grupamento);
      }

      setDivisaoId(memberToEdit.divisaoId || (divisoes[0]?.id || ''));
      setStatus(memberToEdit.status || 'Ativo');
      setPhone(memberToEdit.phone || '');
      setEmail(memberToEdit.email || '');
      setEntryDate(memberToEdit.entryDate || getTodayDateString());
      setGraduationDate(memberToEdit.grupamentoGraduationDate || '');
      setObservations(memberToEdit.observations || '');
    } else {
      // Defaults for new member
      setName('');
      setVulgo('');
      setGrupamento(availableGrupamentos[0]?.name || 'Caveira');
      setCustomGrupamento('');
      setDivisaoId(divisoes[0]?.id || '');
      setStatus('Ativo');
      setPhone('');
      setEmail('');
      setEntryDate(getTodayDateString());
      setGraduationDate('');
      setObservations('');
    }
    setFormError('');
    setActiveTab('geral');
    setShowQuickStatusForm(false);
    setShowQuickGrupamentoForm(false);
  }, [memberToEdit, isOpen, divisoes]);

  if (!isOpen) return null;

  const handleNextTab = () => {
    if (!vulgo.trim()) {
      setFormError('Informe o Nome de Colete do integrante antes de prosseguir.');
      return;
    }
    if (!name.trim()) {
      setFormError('Informe o Nome Completo do integrante.');
      return;
    }
    setFormError('');
    setActiveTab('grupamento');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vulgo.trim()) {
      setFormError('Preencha o Nome de Colete do integrante.');
      setActiveTab('geral');
      return;
    }

    if (!name.trim()) {
      setFormError('Preencha o Nome Completo do integrante.');
      setActiveTab('geral');
      return;
    }

    const currentDivId = divisaoId || (divisoes[0]?.id || '');
    if (!currentDivId) {
      setFormError('Selecione ou cadastre uma Divisão de Lotação.');
      setActiveTab('grupamento');
      return;
    }

    const selectedDivisao = divisoes.find(d => d.id === currentDivId);
    const finalGrupamento = grupamento === 'Outro' ? (customGrupamento.trim() || 'Integrante') : grupamento;

    const newMember: Member = {
      id: memberToEdit ? memberToEdit.id : `mem-${Date.now()}`,
      name: name.trim(),
      vulgo: vulgo.trim(),
      grupamento: finalGrupamento,
      divisaoId: currentDivId,
      divisaoName: selectedDivisao ? selectedDivisao.name : 'Regional',
      status,
      phone: phone.trim(),
      email: email.trim(),
      entryDate: entryDate || getTodayDateString(),
      grupamentoGraduationDate: graduationDate || undefined,
      observations: observations.trim(),
      createdAt: memberToEdit ? memberToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-[#11141a] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#181c24] border-b border-zinc-800 flex items-center justify-between relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/70 border border-red-800/80 flex items-center justify-center text-red-400 font-bold text-lg font-cinzel">
              GOS
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-cinzel tracking-wide">
                {memberToEdit ? 'Editar Integrante • Gestão Operacional Sidnei' : 'Cadastrar Novo Integrante'}
              </h2>
              <p className="text-xs text-zinc-400">
                {memberToEdit ? `Atualização de cadastro de ${memberToEdit.vulgo}` : 'Registro no quadro de grupamentos e divisões'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition"
            aria-label="Fechar"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-[#0e1015] px-6 gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserIcon size={15} />
            1. Dados Pessoais & Nome de Colete
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grupamento')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'grupamento'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldIcon size={15} />
            2. Grupamento & Divisão
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-zinc-100">
          {formError && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2">
              <AlertIcon size={16} className="text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* TAB 1: GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nome de Colete <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vulgo}
                    onChange={(e) => {
                      setVulgo(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Ex: Caveira Sidnei, Marreta, Falcão"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[11px] text-zinc-500">Identificação operacional / nome de colete</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Nome completo do integrante"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (44) 99874-1234"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Status do Integrante
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickStatusForm(!showQuickStatusForm);
                          setQuickStatusError('');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition cursor-pointer"
                        title="Cadastrar novo status"
                      >
                        <Plus size={12} />
                        <span>{showQuickStatusForm ? 'Fechar' : '+ Novo Status'}</span>
                      </button>
                      {onOpenStatusManager && (
                        <button
                          type="button"
                          onClick={onOpenStatusManager}
                          className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-0.5 transition cursor-pointer"
                          title="Gerenciar lista de status"
                        >
                          <Settings2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline quick status creator */}
                  {showQuickStatusForm && (
                    <div className="mb-2 p-3 bg-[#131722] border border-amber-500/40 rounded-xl space-y-2.5 animate-fade-in shadow-lg">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          Criar e Selecionar Status
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowQuickStatusForm(false)}
                          className="text-zinc-400 hover:text-white text-[10px]"
                        >
                          ✕
                        </button>
                      </div>

                      {quickStatusError && (
                        <p className="text-[10px] text-red-400 bg-red-950/50 p-1.5 rounded border border-red-800">
                          {quickStatusError}
                        </p>
                      )}

                      <div>
                        <input
                          type="text"
                          value={quickStatusName}
                          onChange={(e) => setQuickStatusName(e.target.value)}
                          placeholder="Nome (ex: Afastado, Próspero, Reserva...)"
                          className="w-full bg-[#0a0c10] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          autoFocus
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-1">Cor do Badge:</span>
                        <div className="flex flex-wrap gap-1">
                          {STATUS_COLOR_OPTIONS.map((opt) => (
                            <button
                              key={opt.color}
                              type="button"
                              onClick={() => setQuickStatusColor(opt.color)}
                              className={`w-5 h-5 rounded-full ${opt.previewClass} transition ${
                                quickStatusColor === opt.color ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                              title={opt.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowQuickStatusForm(false)}
                          className="px-2 py-1 rounded text-[10px] text-zinc-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isSavingQuickStatus}
                          onClick={async () => {
                            const trimmed = quickStatusName.trim();
                            if (!trimmed) {
                              setQuickStatusError('Informe o nome do status.');
                              return;
                            }
                            setIsSavingQuickStatus(true);
                            try {
                              const newStatusObj: MemberStatusConfig = {
                                id: `status-${Date.now()}`,
                                name: trimmed,
                                color: quickStatusColor,
                                isDefault: false,
                                active: true,
                                createdAt: new Date().toISOString()
                              };
                              if (onSaveStatus) {
                                await onSaveStatus(newStatusObj);
                              }
                              setStatus(trimmed);
                              setQuickStatusName('');
                              setShowQuickStatusForm(false);
                            } catch (err: any) {
                              setQuickStatusError(err?.message || 'Erro ao cadastrar.');
                            } finally {
                              setIsSavingQuickStatus(false);
                            }
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded shadow transition"
                        >
                          {isSavingQuickStatus ? 'Salvando...' : 'Salvar e Selecionar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {activeStatusesList.map((st) => (
                      <option key={st.id || st.name} value={st.name} className="bg-[#12151c]">
                        {st.name} {st.description ? `(${st.description})` : ''}
                      </option>
                    ))}
                    {/* Fallback if member's current status isn't in activeStatusesList */}
                    {!activeStatusesList.some(s => s.name === status) && (
                      <option value={status} className="bg-[#12151c]">{status}</option>
                    )}
                  </select>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">Badge ativo:</span>
                    <MemberStatusBadge status={status} statuses={activeStatusesList} size="sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Data de Entrada / Admissão
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRUPAMENTO & DIVISÃO */}
          {activeTab === 'grupamento' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Grupamento Oficial do Integrante <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickGrupamentoForm(!showQuickGrupamentoForm);
                        setQuickGrupamentoError('');
                      }}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 px-2 py-0.5 rounded transition"
                    >
                      <Plus size={12} />
                      <span>{showQuickGrupamentoForm ? 'Fechar Cadastro' : '+ Novo Grupamento'}</span>
                    </button>

                    {onOpenGrupamentoManager && (
                      <button
                        type="button"
                        onClick={onOpenGrupamentoManager}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded transition"
                        title="Gerenciar todos os grupamentos e patentes"
                      >
                        <Settings2 size={12} />
                        <span>Gerenciar Patentes</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* QUICK INLINE GRUPAMENTO CREATOR */}
                {showQuickGrupamentoForm && (
                  <div className="mb-3.5 p-3.5 bg-[#121620] border border-red-500/50 rounded-xl space-y-3 animate-fade-in shadow-lg">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5 text-red-400">
                        <Sparkles size={14} />
                        <span className="text-xs font-bold text-white">Cadastrar Novo Grupamento / Patente</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickGrupamentoForm(false)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>

                    {quickGrupamentoError && (
                      <div className="text-[11px] text-red-400 bg-red-950/80 border border-red-800 p-2 rounded">
                        {quickGrupamentoError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Nome do Grupamento *</label>
                        <input
                          type="text"
                          value={quickGrupamentoName}
                          onChange={(e) => setQuickGrupamentoName(e.target.value)}
                          placeholder="Ex: Batedor, Guarda de Honra, Disciplina..."
                          className="w-full bg-[#0a0c10] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Descrição Operacional</label>
                        <input
                          type="text"
                          value={quickGrupamentoDesc}
                          onChange={(e) => setQuickGrupamentoDesc(e.target.value)}
                          placeholder="Ex: Responsável pela abertura de comboio"
                          className="w-full bg-[#0a0c10] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Símbolo / Ícone */}
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Símbolo Oficial:</span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                        {GRUPAMENTO_ICON_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => setQuickGrupamentoIcon(opt.type)}
                            className={`p-1.5 rounded border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                              quickGrupamentoIcon === opt.type
                                ? 'border-red-500 bg-red-950/40 text-red-400 ring-1 ring-red-500'
                                : 'border-zinc-800 bg-[#0a0c10] text-zinc-400 hover:text-zinc-200'
                            }`}
                            title={opt.label}
                          >
                            <span className="text-[10px] font-bold capitalize">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cor do Tema */}
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Tonalidade do Badge:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {GRUPAMENTO_THEME_OPTIONS.map((opt) => (
                          <button
                            key={opt.theme}
                            type="button"
                            onClick={() => setQuickGrupamentoTheme(opt.theme)}
                            className={`px-2 py-1 rounded text-[10px] font-medium border flex items-center gap-1.5 transition ${
                              quickGrupamentoTheme === opt.theme
                                ? 'border-red-500 bg-zinc-800 text-white ring-1 ring-red-500'
                                : 'border-zinc-800 bg-[#0a0c10] text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${opt.previewClass}`} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowQuickGrupamentoForm(false)}
                        className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isSavingQuickGrupamento}
                        onClick={async () => {
                          const trimmed = quickGrupamentoName.trim();
                          if (!trimmed) {
                            setQuickGrupamentoError('Informe o nome do grupamento.');
                            return;
                          }
                          const duplicate = availableGrupamentos.some(
                            g => g.name.toLowerCase() === trimmed.toLowerCase()
                          );
                          if (duplicate) {
                            setQuickGrupamentoError(`O grupamento "${trimmed}" já está cadastrado.`);
                            return;
                          }
                          setIsSavingQuickGrupamento(true);
                          try {
                            const selectedTheme = GRUPAMENTO_THEME_OPTIONS.find(t => t.theme === quickGrupamentoTheme) || GRUPAMENTO_THEME_OPTIONS[0];
                            const newGrupConfig: GrupamentoConfig = {
                              id: `grup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                              name: trimmed,
                              description: quickGrupamentoDesc.trim() || undefined,
                              colorTheme: quickGrupamentoTheme,
                              iconType: quickGrupamentoIcon,
                              badgeBg: selectedTheme.badgeBg,
                              borderColor: selectedTheme.borderColor,
                              color: selectedTheme.textColor,
                              isDefault: false,
                              active: true,
                              createdAt: new Date().toISOString()
                            };

                            if (onSaveGrupamento) {
                              await onSaveGrupamento(newGrupConfig);
                            }

                            setGrupamento(trimmed);
                            setCustomGrupamento('');
                            setQuickGrupamentoName('');
                            setQuickGrupamentoDesc('');
                            setShowQuickGrupamentoForm(false);
                          } catch (err: any) {
                            setQuickGrupamentoError(err?.message || 'Erro ao cadastrar grupamento.');
                          } finally {
                            setIsSavingQuickGrupamento(false);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                      >
                        <CheckIcon size={12} />
                        <span>{isSavingQuickGrupamento ? 'Cadastrando...' : 'Salvar e Vincular'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* GRUPAMENTOS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {availableGrupamentos.map((g) => {
                    const isSelected = grupamento.toLowerCase() === g.name.toLowerCase();
                    return (
                      <button
                        key={g.id || g.name}
                        type="button"
                        onClick={() => {
                          setGrupamento(g.name);
                          if (formError) setFormError('');
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? `${g.badgeBg || 'bg-red-950/40 border-red-700 text-red-200'} border-2 shadow-lg scale-[1.01]`
                            : 'bg-[#0c0e12] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="pt-0.5">
                          <GrupamentoBadge 
                            grupamento={g.name} 
                            grupamentos={availableGrupamentos}
                            size="sm" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-white truncate">{g.name}</p>
                            {g.isDefault && (
                              <span className="text-[9px] text-zinc-500 bg-zinc-800/80 px-1 py-0.2 rounded">
                                Padrão
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                            {g.description || 'Grupamento operacional'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="radio"
                      checked={grupamento === 'Outro'}
                      onChange={() => setGrupamento('Outro')}
                      className="accent-red-500"
                    />
                    <span>Outro Grupamento / Posição Personalizada Manual</span>
                  </label>
                  {grupamento === 'Outro' && (
                    <input
                      type="text"
                      value={customGrupamento}
                      onChange={(e) => setCustomGrupamento(e.target.value)}
                      placeholder="Especifique o grupamento ou função"
                      className="mt-2 w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Divisão de Lotação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={divisaoId}
                    onChange={(e) => {
                      setDivisaoId(e.target.value);
                      if (formError) setFormError('');
                    }}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
                  >
                    {divisoes.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#12151c]">
                        {d.name} ({d.city} - {d.state})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Divisões disponíveis: {divisoes.map(d => d.name).join(', ')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Data de Graduação / Promoção no Grupamento
                  </label>
                  <input
                    type="date"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Data em que conquistou o brevê/grupamento atual
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Observações de Disciplina & Histórico
                </label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Anotações internas, histórico de viagens, cargos prévios ou atribuições especiais..."
                  className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                ></textarea>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-xs transition"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'grupamento' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('geral')}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Voltar</span>
                </button>
              )}

              {activeTab === 'geral' && (
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <span>Próxima Etapa: Grupamento</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/80 flex items-center gap-2"
              >
                <CheckIcon size={16} />
                {memberToEdit ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

