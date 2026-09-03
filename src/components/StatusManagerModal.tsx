import React, { useState } from 'react';
import { 
  X, Plus, Tag, Edit3, Trash2, Check, AlertTriangle, 
  ShieldAlert, Sparkles, CheckCircle2 
} from 'lucide-react';
import { Member, MemberStatusConfig, StatusColor, DEFAULT_MEMBER_STATUSES } from '../types';
import { STATUS_COLOR_OPTIONS, STATUS_COLOR_MAP } from '../utils/statusUtils';
import { MemberStatusBadge } from './MemberStatusBadge';

interface StatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: MemberStatusConfig[];
  members: Member[];
  onSaveStatus: (status: MemberStatusConfig) => Promise<void> | void;
  onDeleteStatus: (statusId: string) => Promise<void> | void;
  onSelectNewStatus?: (statusName: string) => void;
}

export const StatusManagerModal: React.FC<StatusManagerModalProps> = ({
  isOpen,
  onClose,
  statuses,
  members,
  onSaveStatus,
  onDeleteStatus,
  onSelectNewStatus
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [statusName, setStatusName] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  const [statusColor, setStatusColor] = useState<StatusColor>('emerald');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setStatusName('');
    setStatusDescription('');
    setStatusColor('emerald');
    setFormError('');
    setIsCreating(false);
    setEditingId(null);
    setDeleteConfirmId(null);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (status: MemberStatusConfig) => {
    setStatusName(status.name);
    setStatusDescription(status.description || '');
    setStatusColor(status.color);
    setEditingId(status.id);
    setIsCreating(false);
    setFormError('');
    setDeleteConfirmId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = statusName.trim();
    if (!trimmedName) {
      setFormError('Informe o nome do status.');
      return;
    }

    // Check duplicate
    const isDuplicate = statuses.some(
      s => s.name.trim().toLowerCase() === trimmedName.toLowerCase() && s.id !== editingId
    );
    if (isDuplicate) {
      setFormError(`Já existe um status cadastrado com o nome "${trimmedName}".`);
      return;
    }

    setIsSubmitting(true);
    try {
      const statusData: MemberStatusConfig = {
        id: editingId || `status-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: trimmedName,
        description: statusDescription.trim() || undefined,
        color: statusColor,
        isDefault: editingId ? statuses.find(s => s.id === editingId)?.isDefault || false : false,
        active: true,
        createdAt: editingId ? statuses.find(s => s.id === editingId)?.createdAt : new Date().toISOString()
      };

      await onSaveStatus(statusData);

      if (onSelectNewStatus) {
        onSelectNewStatus(trimmedName);
      }

      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Erro ao salvar o status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (statusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    if (!status) return;

    if (status.isDefault) {
      setFormError('Os status padrão do sistema não podem ser excluídos.');
      return;
    }

    const membersWithStatus = members.filter(
      m => m.status.trim().toLowerCase() === status.name.trim().toLowerCase()
    );

    if (membersWithStatus.length > 0 && deleteConfirmId !== statusId) {
      setDeleteConfirmId(statusId);
      return;
    }

    try {
      await onDeleteStatus(statusId);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setFormError(err?.message || 'Erro ao excluir o status.');
    }
  };

  // Count members for each status
  const getMemberCount = (name: string) => {
    return members.filter(m => m.status.trim().toLowerCase() === name.trim().toLowerCase()).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className="bg-[#0f1218] border border-zinc-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#141822] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/40 flex items-center justify-center text-amber-200 shadow-md">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Status dos Integrantes
                <span className="text-xs font-mono font-normal bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                  {statuses.length} cadastrados
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Gerencie e cadastre novas situações operacionais para os membros
              </p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/80 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action to trigger Create Form */}
          {!isCreating && !editingId && (
            <div className="flex items-center justify-between bg-[#12151d] p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Sparkles size={16} className="text-amber-400" />
                <span>Precisa de um status personalizado para a regional?</span>
              </div>
              <button
                type="button"
                onClick={startCreate}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950 transition"
              >
                <Plus size={15} />
                <span>Novo Status</span>
              </button>
            </div>
          )}

          {/* Create or Edit Form */}
          {(isCreating || editingId) && (
            <form onSubmit={handleSubmit} className="bg-[#131722] border border-red-500/30 p-4.5 rounded-xl space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Tag size={14} />
                  {editingId ? 'Editar Status' : 'Cadastrar Novo Status'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-zinc-400 hover:text-white text-xs underline"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nome do Status <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={statusName}
                    onChange={(e) => setStatusName(e.target.value)}
                    placeholder="Ex: Afastado, Próspero, Meio Escudo, Reserva..."
                    className="w-full bg-[#0a0c10] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Cor Visual do Badge
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {STATUS_COLOR_OPTIONS.map((opt) => {
                      const isSelected = statusColor === opt.color;
                      return (
                        <button
                          key={opt.color}
                          type="button"
                          onClick={() => setStatusColor(opt.color)}
                          title={opt.label}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left transition cursor-pointer text-[11px] ${
                            isSelected
                              ? 'bg-zinc-800 border-white text-white shadow'
                              : 'bg-[#0a0c10] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${opt.previewClass} shrink-0`} />
                          <span className="truncate">{opt.color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Descrição Operacional / Finalidade (Opcional)
                </label>
                <input
                  type="text"
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  placeholder="Ex: Integrante em período probatório de 6 meses"
                  className="w-full bg-[#0a0c10] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Live Preview */}
              <div className="bg-[#0a0c10] p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  <span>Prévia do Badge:</span>
                </div>
                <div>
                  <MemberStatusBadge 
                    status={statusName.trim() || 'Nome do Status'} 
                    statuses={[{ id: 'preview', name: statusName.trim() || 'Nome do Status', color: statusColor, active: true }]} 
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950"
                >
                  {isSubmitting ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingId ? 'Salvar Alterações' : 'Cadastrar Status'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Delete Warning Prompt */}
          {deleteConfirmId && (
            <div className="p-4 bg-red-950/80 border border-red-600 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-200">
                  <p className="font-bold text-white mb-1">Confirmar exclusão de status em uso?</p>
                  <p>
                    Existem <strong className="text-amber-400 font-bold">{getMemberCount(statuses.find(s => s.id === deleteConfirmId)?.name || '')} integrante(s)</strong> vinculados a este status.
                  </p>
                  <p className="text-zinc-400 mt-1">
                    Ao excluir, os integrantes continuarão no sistema, mas você precisará atualizar a situação deles.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Sim, Excluir Status
                </button>
              </div>
            </div>
          )}

          {/* List of Registered Statuses */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Status Ativos no Sistema ({statuses.length})
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {statuses.map((s) => {
                const count = getMemberCount(s.name);
                const colorStyle = STATUS_COLOR_MAP[s.color] || STATUS_COLOR_MAP.zinc;

                return (
                  <div
                    key={s.id}
                    className="p-3.5 bg-[#12151e] border border-zinc-800/90 rounded-xl hover:border-zinc-700 transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        <MemberStatusBadge status={s.name} statuses={statuses} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate flex items-center gap-2">
                          <span>{s.name}</span>
                          {s.isDefault ? (
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                              Padrão
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono">
                              Personalizado
                            </span>
                          )}
                        </p>
                        {s.description && (
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {count}
                        </span>
                        <span className="text-[11px] text-zinc-500 ml-1">
                          {count === 1 ? 'membro' : 'membros'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          title="Editar este status"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        >
                          <Edit3 size={15} />
                        </button>

                        {!s.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            title="Excluir este status"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/60 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#141822] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>
            As alterações são sincronizadas em tempo real no banco de dados.
          </span>
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
