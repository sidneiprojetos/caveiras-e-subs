import React from 'react';
import { History, Shield, Clock, UserCheck, AlertCircle, FileText } from 'lucide-react';
import { ActivityLog } from '../types';

interface AuditLogsViewProps {
  logs: ActivityLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'CADASTRO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">CADASTRO</span>;
      case 'EDICAO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">EDIÇÃO</span>;
      case 'EXCLUSAO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">EXCLUSÃO</span>;
      case 'DIVISAO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">DIVISÃO</span>;
      case 'ACESSO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800">ACESSO</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">LOG</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#141720] via-[#1a1e28] to-[#141720] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-400">Rastreabilidade & Governança</span>
        </div>
        <h2 className="text-2xl font-black text-white font-cinzel tracking-wide">
          Registro de Atividades & Auditoria
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-xl">
          Histórico das operações realizadas por administradores no cadastro de membros, divisões e alterações estruturais.
        </p>
      </div>

      {/* Timeline List */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
          <span className="font-semibold uppercase tracking-wider">Histórico Recente ({logs.length} eventos)</span>
          <span className="font-mono text-[11px]">Horário Local</span>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#0b0d12] border border-zinc-800/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getActionBadge(log.action)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{log.target}</span>
                    <span className="text-[11px] text-zinc-400">• Realizado por <strong className="text-zinc-200">{log.adminName}</strong></span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {log.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono shrink-0 sm:self-center">
                <Clock size={12} />
                <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-10 text-center text-xs text-zinc-500">
              Nenhuma atividade registrada no histórico ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
