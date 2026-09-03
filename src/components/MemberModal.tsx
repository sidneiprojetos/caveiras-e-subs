import React, { useState, useEffect } from 'react';
import { Member, Divisao, MemberStatus, DEFAULT_GRUPAMENTOS, MemberStatusConfig, DEFAULT_MEMBER_STATUSES, StatusColor } from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';
import { MemberStatusBadge } from './MemberStatusBadge';
import { STATUS_COLOR_OPTIONS } from '../utils/statusUtils';
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
  Settings2
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
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
  divisoes,
  statuses,
  onOpenStatusManager,
  onSaveStatus
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

  const activeStatusesList = statuses && statuses.length > 0 ? statuses : DEFAULT_MEMBER_STATUSES;

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setVulgo(memberToEdit.vulgo || '');
      
      const isPredefined = DEFAULT_GRUPAMENTOS.some(g => g.name === memberToEdit.grupamento);
      if (isPredefined) {
        setGrupamento(memberToEdit.grupamento);
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
      setGrupamento('Caveira');
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
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Grupamento Oficial do Integrante <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_GRUPAMENTOS.map((g) => {
                    const isSelected = grupamento === g.name;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => {
                          setGrupamento(g.name);
                          if (formError) setFormError('');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? `${g.badgeBg} ${g.borderColor} border-2 shadow-lg scale-[1.01]`
                            : 'bg-[#0c0e12] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="pt-0.5">
                          <GrupamentoBadge grupamento={g.name} size="sm" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white mb-0.5">{g.name}</p>
                          <p className="text-[11px] text-zinc-400 leading-tight">{g.description}</p>
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
                    <span>Outro Grupamento / Posição Personalizada</span>
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

