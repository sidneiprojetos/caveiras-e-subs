import React, { useState } from 'react';
import { History, Shield, Clock, FileSpreadsheet, Search, Filter, Printer } from 'lucide-react';
import { ActivityLog } from '../types';
import { printAuditLogs } from '../utils/printService';

interface AuditLogsViewProps {
  logs: ActivityLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTarget = log.target.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchAdmin = log.adminName.toLowerCase().includes(q);
      if (!matchTarget && !matchDetails && !matchAdmin) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Data e Hora', 'Ação', 'Alvo', 'Realizado Por', 'Detalhes'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString('pt-BR')}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.adminName}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gestao_operacional_sidnei_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141720] via-[#1a1e28] to-[#141720] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => printAuditLogs(filteredLogs, 'Relatório de Auditoria de Atividades')}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-zinc-700 shadow-sm"
          >
            <Printer size={15} className="text-amber-400" />
            Imprimir Relatório
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-zinc-700 shadow-sm"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101319] border border-zinc-800/80 p-3.5 rounded-xl flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por integrante, ação ou responsável..."
            className="w-full bg-[#0c0e12] border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0c0e12] px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 text-[11px]">Tipo de Ação:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#12151c]">Todas as Ações</option>
            <option value="CADASTRO" className="bg-[#12151c]">Cadastro</option>
            <option value="EDICAO" className="bg-[#12151c]">Edição</option>
            <option value="EXCLUSAO" className="bg-[#12151c]">Exclusão</option>
            <option value="DIVISAO" className="bg-[#12151c]">Divisão</option>
            <option value="ACESSO" className="bg-[#12151c]">Acesso</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs text-zinc-400">
          <span className="font-semibold uppercase tracking-wider">
            Mostrando {filteredLogs.length} de {logs.length} eventos
          </span>
          <span className="font-mono text-[11px]">Horário Local</span>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
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

          {filteredLogs.length === 0 && (
            <div className="py-10 text-center text-xs text-zinc-500">
              Nenhuma atividade registrada no histórico para os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
