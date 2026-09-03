import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export interface DeleteTargetInfo {
  type: 'member' | 'divisao';
  id: string;
  title: string;
  subtitle?: string;
  warning?: string;
  blockedReason?: string;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  target: DeleteTargetInfo | null;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  target,
}) => {
  if (!isOpen || !target) return null;

  const isBlocked = Boolean(target.blockedReason);

  const handleConfirm = () => {
    if (isBlocked) return;
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#12151c] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
        {/* Top Red Accent */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 w-full" />

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
              {isBlocked ? <AlertTriangle size={20} className="text-amber-400" /> : <Trash2 size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-cinzel">
                {isBlocked ? 'Ação Bloqueada' : 'Confirmar Exclusão'}
              </h3>
              <p className="text-xs text-zinc-400">
                {target.type === 'member' ? 'Exclusão de Integrante • Op. Sid' : 'Exclusão de Divisão Regional'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-3 space-y-4">
          <div className="bg-[#0a0c10] border border-zinc-800 rounded-xl p-4 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              Registro Selecionado:
            </span>
            <p className="text-base font-bold text-white">
              {target.title}
            </p>
            {target.subtitle && (
              <p className="text-xs text-zinc-400">
                {target.subtitle}
              </p>
            )}
          </div>

          {isBlocked ? (
            <div className="bg-amber-950/30 border border-amber-800/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-200 mb-0.5">Não é possível excluir agora:</strong>
                <span>{target.blockedReason}</span>
              </div>
            </div>
          ) : (
            <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-300">
              <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-red-200 mb-0.5">Atenção:</strong>
                <span>
                  {target.warning || 'Esta ação é irreversível. O registro será removido permanentemente e registrado na auditoria.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#161a22] border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition"
          >
            {isBlocked ? 'Fechar' : 'Cancelar'}
          </button>

          {!isBlocked && (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Confirmar Exclusão</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
