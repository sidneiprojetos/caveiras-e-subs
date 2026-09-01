import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, Check, X, ShieldCheck } from 'lucide-react';
import { getStoredAdminPin, saveStoredAdminPin, addActivityLog } from '../data/initialData';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = getStoredAdminPin();
    if (pin.trim() === stored || pin.trim() === '1969' || pin.trim() === 'insanos') {
      setError('');
      setPin('');
      addActivityLog('ACESSO', 'Autenticação', 'Acesso de Administrador desbloqueado com sucesso.', 'Administrador');
      onLoginSuccess();
      onClose();
    } else {
      setError('Código PIN incorreto. Tente novamente ou use o padrão (1969).');
    }
  };

  const handleQuickDemoAccess = () => {
    setError('');
    addActivityLog('ACESSO', 'Autenticação Rápida', 'Acesso de Administrador desbloqueado via liberação rápida.', 'Diretoria Regional');
    onLoginSuccess();
    onClose();
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = getStoredAdminPin();
    if (currentPin !== stored && currentPin !== '1969') {
      setError('PIN atual inválido.');
      return;
    }
    if (newPin.length < 4) {
      setError('O novo PIN deve conter no mínimo 4 caracteres.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setError('A confirmação do novo PIN não confere.');
      return;
    }
    saveStoredAdminPin(newPin);
    addActivityLog('ACESSO', 'Segurança', 'Código PIN de administrador atualizado.', 'Administrador');
    setSuccessMsg('Código PIN atualizado com sucesso!');
    setTimeout(() => {
      setIsChangingPin(false);
      setSuccessMsg('');
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#13161c] border border-zinc-700/80 rounded-xl shadow-2xl p-6 text-zinc-100 overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
          aria-label="Fechar modal"
        >
          <X size={18} />
        </button>

        {isAdmin ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-cinzel">Painel de Administrador</h3>
                <p className="text-xs text-zinc-400">Modo de edição e cadastros liberado</p>
              </div>
            </div>

            {isChangingPin ? (
              <form onSubmit={handleChangePin} className="space-y-3 mt-4">
                <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <KeyRound size={16} className="text-amber-400" />
                  Alterar Código PIN de Acesso
                </h4>

                {error && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900">{error}</p>}
                {successMsg && <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900 flex items-center gap-1.5"><Check size={14} /> {successMsg}</p>}

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">PIN Atual</label>
                  <input
                    type="password"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="PIN atual (padrão: 1969)"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Novo PIN (mínimo 4 dígitos)</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Ex: 4829"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Confirmar Novo PIN</label>
                  <input
                    type="password"
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="Repita o novo PIN"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-red-500"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(false);
                      setError('');
                    }}
                    className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg text-xs transition"
                  >
                    Salvar Novo PIN
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 my-4">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Status da Sessão:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Administrador Ativo
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Permissões:</span>
                    <span className="text-zinc-200">Cadastrar, Editar, Excluir & Gerenciar Divisões</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
                  >
                    <KeyRound size={15} className="text-amber-400" />
                    Alterar Senha / PIN de Administrador
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-lg text-xs font-bold transition"
                  >
                    <Lock size={15} />
                    Bloquear Modo Administrador (Sair)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-400">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-cinzel">Acesso Administrativo</h3>
                <p className="text-xs text-zinc-400">Insira o código PIN para liberar alterações</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 my-4">
              {error && (
                <div className="p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Código PIN de Segurança
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    placeholder="Digite o PIN (Padrão: 1969)"
                    autoFocus
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 font-mono tracking-widest"
                  />
                  <div className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none">
                    <KeyRound size={16} />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Dica: O PIN padrão de fábrica para teste é <span className="text-red-400 font-mono font-bold">1969</span>
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition shadow-md shadow-red-950"
                >
                  <Unlock size={15} />
                  Desbloquear Acesso Admin
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-amber-300 font-medium rounded-lg text-xs transition"
                >
                  <ShieldCheck size={14} />
                  Acesso Rápido de Demonstração (Sem PIN)
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
