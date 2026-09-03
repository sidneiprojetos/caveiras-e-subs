import React, { useState } from 'react';
import { 
  X, Plus, Award, Edit3, Trash2, Check, AlertTriangle, 
  ShieldAlert, Sparkles, CheckCircle2, Shield, Skull, Star, Crosshair, Zap, Flame, Flag
} from 'lucide-react';
import { Member, GrupamentoConfig, GrupamentoColorTheme, GrupamentoIconType, DEFAULT_GRUPAMENTOS } from '../types';
import { GRUPAMENTO_THEME_OPTIONS, GRUPAMENTO_ICON_OPTIONS, getGrupamentoConfig } from '../utils/grupamentoUtils';
import { GrupamentoBadge } from './GrupamentoBadge';

interface GrupamentoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupamentos: GrupamentoConfig[];
  members: Member[];
  onSaveGrupamento: (grupamento: GrupamentoConfig) => Promise<void> | void;
  onDeleteGrupamento: (grupamentoId: string) => Promise<void> | void;
  isAdmin: boolean;
  onRequireAdmin?: () => void;
  onSelectNewGrupamento?: (grupamentoName: string) => void;
}

export const GrupamentoManagerModal: React.FC<GrupamentoManagerModalProps> = ({
  isOpen,
  onClose,
  grupamentos,
  members,
  onSaveGrupamento,
  onDeleteGrupamento,
  isAdmin,
  onRequireAdmin,
  onSelectNewGrupamento
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [grupamentoName, setGrupamentoName] = useState('');
  const [grupamentoDescription, setGrupamentoDescription] = useState('');
  const [colorTheme, setColorTheme] = useState<GrupamentoColorTheme>('red');
  const [iconType, setIconType] = useState<GrupamentoIconType>('shield');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentList = grupamentos && grupamentos.length > 0 ? grupamentos : DEFAULT_GRUPAMENTOS;

  const resetForm = () => {
    setGrupamentoName('');
    setGrupamentoDescription('');
    setColorTheme('red');
    setIconType('shield');
    setFormError('');
    setIsCreating(false);
    setEditingId(null);
    setDeleteConfirmId(null);
  };

  const startCreate = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (grup: GrupamentoConfig) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setGrupamentoName(grup.name);
    setGrupamentoDescription(grup.description || '');
    setColorTheme(grup.colorTheme || 'red');
    setIconType(grup.iconType || 'shield');
    setEditingId(grup.id);
    setIsCreating(false);
    setFormError('');
    setDeleteConfirmId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    const trimmedName = grupamentoName.trim();
    if (!trimmedName) {
      setFormError('Informe o nome do grupamento.');
      return;
    }

    // Check duplicate
    const isDuplicate = currentList.some(
      g => g.name.trim().toLowerCase() === trimmedName.toLowerCase() && g.id !== editingId
    );
    if (isDuplicate) {
      setFormError(`Já existe um grupamento cadastrado com o nome "${trimmedName}".`);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTheme = GRUPAMENTO_THEME_OPTIONS.find(t => t.theme === colorTheme) || GRUPAMENTO_THEME_OPTIONS[0];

      const grupamentoData: GrupamentoConfig = {
        id: editingId || `grup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: trimmedName,
        description: grupamentoDescription.trim() || undefined,
        colorTheme,
        iconType,
        badgeBg: selectedTheme.badgeBg,
        borderColor: selectedTheme.borderColor,
        color: selectedTheme.textColor,
        isDefault: editingId ? currentList.find(g => g.id === editingId)?.isDefault || false : false,
        active: true,
        createdAt: editingId ? currentList.find(g => g.id === editingId)?.createdAt : new Date().toISOString()
      };

      await onSaveGrupamento(grupamentoData);

      if (onSelectNewGrupamento) {
        onSelectNewGrupamento(trimmedName);
      }

      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Erro ao salvar grupamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (grup: GrupamentoConfig) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    // Check if members are using this grupamento
    const membersWithThisGrupamento = members.filter(
      m => m.grupamento.toLowerCase().trim() === grup.name.toLowerCase().trim()
    );

    if (membersWithThisGrupamento.length > 0) {
      setFormError(
        `Não é possível excluir o grupamento "${grup.name}". Existem ${membersWithThisGrupamento.length} integrante(s) vinculado(s) a ele.`
      );
      return;
    }

    try {
      await onDeleteGrupamento(grup.id);
      setDeleteConfirmId(null);
      if (editingId === grup.id) {
        resetForm();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Erro ao remover grupamento.');
    }
  };

  const renderIcon = (type: GrupamentoIconType, size = 16) => {
    switch (type) {
      case 'skull':
        return <Skull size={size} />;
      case 'shield':
        return <Shield size={size} />;
      case 'star':
        return <Star size={size} />;
      case 'crosshair':
        return <Crosshair size={size} />;
      case 'award':
        return <Award size={size} />;
      case 'zap':
        return <Zap size={size} />;
      case 'flame':
        return <Flame size={size} />;
      case 'flag':
        return <Flag size={size} />;
      default:
        return <Award size={size} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#0e1117] border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-[#141820] to-[#0e1117]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/70 border border-red-800/80 flex items-center justify-center text-red-400 shadow-md">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-cinzel tracking-wide flex items-center gap-2">
                Gerenciador de Grupamentos & Patentes
                <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {currentList.length} cadastrados
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Cadastre novas patentes, grupamentos operacionais e especifique cores e insígnias oficiais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-3 text-red-300 text-xs">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Aviso Operacional</span>
                <span>{formError}</span>
              </div>
              <button onClick={() => setFormError('')} className="text-red-400 hover:text-red-200">
                <X size={14} />
              </button>
            </div>
          )}

          {/* TOP ACTION: ADD NEW BUTTON */}
          {!isCreating && !editingId && (
            <div className="flex items-center justify-between bg-[#121620] border border-zinc-800 p-4 rounded-xl">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">Grupamentos e Graduações Cadastrados</h4>
                <p className="text-xs text-zinc-400">
                  Gerencie as graduações disponíveis para os integrantes no sistema.
                </p>
              </div>
              <button
                type="button"
                onClick={startCreate}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus size={15} />
                <span>+ Novo Grupamento</span>
              </button>
            </div>
          )}

          {/* FORM: CREATE OR EDIT */}
          {(isCreating || editingId) && (
            <form onSubmit={handleSubmit} className="bg-[#121620] border border-red-500/40 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">
                    {editingId ? 'Editar Grupamento' : 'Cadastrar Novo Grupamento'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nome do Grupamento / Patente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={grupamentoName}
                    onChange={(e) => setGrupamentoName(e.target.value)}
                    placeholder="Ex: Batedor, Guarda de Honra, Disciplina, Próspero..."
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Descrição Operacional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={grupamentoDescription}
                    onChange={(e) => setGrupamentoDescription(e.target.value)}
                    placeholder="Ex: Responsável pelo apoio e segurança do comboio"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* ICON PICKER */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Ícone Oficial / Símbolo:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GRUPAMENTO_ICON_OPTIONS.map((opt) => {
                    const isSelected = iconType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setIconType(opt.type)}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'border-red-500 bg-red-950/40 text-white ring-1 ring-red-500'
                            : 'border-zinc-800 bg-[#0c0e12] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <div className={isSelected ? 'text-red-400' : 'text-zinc-400'}>
                          {renderIcon(opt.type, 18)}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate leading-tight">{opt.label}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">{opt.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLOR THEME PICKER */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Tonalidade do Badge Operacional:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GRUPAMENTO_THEME_OPTIONS.map((opt) => {
                    const isSelected = colorTheme === opt.theme;
                    return (
                      <button
                        key={opt.theme}
                        type="button"
                        onClick={() => setColorTheme(opt.theme)}
                        className={`p-2 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-red-500 bg-zinc-800/90 ring-1 ring-red-500 text-white'
                            : 'border-zinc-800 bg-[#0c0e12] text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${opt.previewClass} shrink-0`} />
                        <span className="text-xs font-medium truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PREVIEW */}
              <div className="p-3 bg-[#0a0c10] rounded-lg border border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Prévia do Badge no Sistema:</span>
                <GrupamentoBadge 
                  grupamento={grupamentoName.trim() || 'Nome do Grupamento'} 
                  grupamentos={[{
                    id: 'temp-preview',
                    name: grupamentoName.trim() || 'Nome do Grupamento',
                    description: grupamentoDescription,
                    colorTheme,
                    iconType,
                    active: true
                  }]}
                  size="md"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Check size={15} />
                  <span>{isSubmitting ? 'Salvando...' : editingId ? 'Atualizar Grupamento' : 'Salvar Grupamento'}</span>
                </button>
              </div>
            </form>
          )}

          {/* LIST OF REGISTERED GRUPAMENTOS */}
          <div className="space-y-3">
            {currentList.map((grup) => {
              const membersCount = members.filter(
                m => m.grupamento.toLowerCase().trim() === grup.name.toLowerCase().trim()
              ).length;
              const isDeleting = deleteConfirmId === grup.id;

              return (
                <div
                  key={grup.id}
                  className="bg-[#121620] border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <GrupamentoBadge 
                      grupamento={grup.name} 
                      grupamentos={currentList}
                      size="md" 
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{grup.name}</h4>
                        {grup.isDefault && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-700">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {grup.description || 'Sem descrição cadastrada'}
                      </p>
                    </div>
                  </div>

                  {/* Members count and actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {membersCount} {membersCount === 1 ? 'membro' : 'membros'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">no efetivo</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(grup)}
                        className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                        title="Editar grupamento"
                      >
                        <Edit3 size={15} />
                      </button>

                      {!grup.isDefault && (
                        <>
                          {isDeleting ? (
                            <div className="flex items-center gap-1 bg-red-950/80 border border-red-800 p-1 rounded-lg animate-fade-in">
                              <span className="text-[10px] text-red-300 font-bold px-1">Excluir?</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(grup)}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px]"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setFormError('');
                                setDeleteConfirmId(grup.id);
                              }}
                              className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                              title={membersCount > 0 ? 'Não é possível excluir grupamentos com membros' : 'Excluir grupamento'}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-[#0c0e12] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Sincronização em tempo real com o banco de dados Firebase Firestore</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
