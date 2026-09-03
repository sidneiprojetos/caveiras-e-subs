import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Printer, Download, FileSpreadsheet, Shield, Skull, Crosshair, Star, 
  Users, MapPin, Filter, Upload, CheckCircle2
} from 'lucide-react';
import { Member, Divisao, DEFAULT_GRUPAMENTOS } from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';
import { printRosterReport } from '../utils/printService';
import { formatDateBR } from '../utils/dateUtils';

interface ReportsViewProps {
  members: Member[];
  divisoes: Divisao[];
  onImportBackup: (importedMembers: Member[], importedDivisoes: Divisao[]) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  members,
  divisoes,
  onImportBackup
}) => {
  const [filterDivisao, setFilterDivisao] = useState<string>('all');
  const [filterGrupamento, setFilterGrupamento] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [importStatus, setImportStatus] = useState<string>('');

  // Calculations for KPI
  const totalMembers = members.length;
  const caveiras = members.filter(m => m.grupamento === 'Caveira').length;
  const subdiretores = members.filter(m => m.grupamento === 'Subdiretor').length;
  const operacionais = members.filter(m => m.grupamento === 'Operacional Regional').length;
  const subdiretoresCaveiras = members.filter(m => m.grupamento === 'Subdiretor / Caveira').length;
  const ativos = members.filter(m => m.status === 'Ativo').length;

  const grupamentoData = [
    { name: 'Caveira', value: caveiras, fill: '#ef4444' },
    { name: 'Subdiretor', value: subdiretores, fill: '#f59e0b' },
    { name: 'Operacional Reg.', value: operacionais, fill: '#3b82f6' },
    { name: 'Subdiretor/Caveira', value: subdiretoresCaveiras, fill: '#a855f7' },
  ].filter(d => d.value > 0);

  // Divisões Chart Data
  const divisaoData = divisoes.map(d => {
    const count = members.filter(m => m.divisaoId === d.id).length;
    return {
      name: d.name.replace('Umuarama ', 'Umuarama\n'),
      fullName: d.name,
      integrantes: count
    };
  });

  // Filtered members for printable roster
  const filteredRoster = members.filter(m => {
    if (filterDivisao !== 'all' && m.divisaoId !== filterDivisao) return false;
    if (filterGrupamento !== 'all' && m.grupamento !== filterGrupamento) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  // Handlers
  const handlePrint = () => {
    let filterLabel = 'Quadro Geral de Efetivo';
    if (filterDivisao !== 'all') {
      const d = divisoes.find(div => div.id === filterDivisao);
      if (d) filterLabel = `Efetivo - Divisão ${d.name}`;
    }
    if (filterGrupamento !== 'all') {
      filterLabel += ` (${filterGrupamento})`;
    }
    printRosterReport(filteredRoster, filterLabel);
  };

  const handleExportCSV = () => {
    const headers = [
      'Nome de Colete',
      'Nome Completo',
      'Grupamento',
      'Divisão',
      'Status',
      'Telefone',
      'Email',
      'Data de Entrada',
      'Data de Graduação'
    ];

    const rows = filteredRoster.map(m => [
      `"${m.vulgo}"`,
      `"${m.name}"`,
      `"${m.grupamento}"`,
      `"${m.divisaoName}"`,
      `"${m.status}"`,
      `"${m.phone}"`,
      `"${m.email || ''}"`,
      `"${m.entryDate}"`,
      `"${m.grupamentoGraduationDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gestao_operacional_sidnei_efetivo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const data = {
      app: 'Gestão Operacional Sidnei - Sistema de Grupamentos e Divisões',
      exportedAt: new Date().toISOString(),
      divisoes,
      members
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestao_operacional_sidnei_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.divisoes)) {
          onImportBackup(parsed.members, parsed.divisoes);
          setImportStatus('Backup restaurado com sucesso!');
          setTimeout(() => setImportStatus(''), 4000);
        } else {
          setImportStatus('Erro: Arquivo JSON inválido. Estrutura de backup não reconhecida.');
          setTimeout(() => setImportStatus(''), 5000);
        }
      } catch (err) {
        setImportStatus('Erro ao processar o arquivo JSON.');
        setTimeout(() => setImportStatus(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141720] via-[#1a1e29] to-[#141720] border border-zinc-800 p-6 rounded-2xl shadow-xl no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-red-400">Inteligência & Gestão</span>
          </div>
          <h2 className="text-2xl font-black text-white font-cinzel tracking-wide">
            Relatórios Detalhados & Estatísticas
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Censo de grupamentos (Caveira, Subdiretor, Operacional Regional, Subdiretor/Caveira), divisões territoriais e exportações oficiais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-zinc-700 shadow-sm"
          >
            <Printer size={15} className="text-amber-400" />
            Imprimir Relatório Oficial
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-emerald-800/80 shadow-sm"
          >
            <FileSpreadsheet size={15} />
            Exportar CSV / Excel
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-zinc-800 shadow-sm"
          >
            <Download size={15} />
            Backup JSON
          </button>

          <label className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-zinc-800 shadow-sm cursor-pointer">
            <Upload size={15} />
            Restaurar
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{importStatus}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 no-print">
        {/* Total Members */}
        <div className="bg-[#12151c] border border-zinc-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Total Integrantes</span>
            <Users size={16} className="text-zinc-300" />
          </div>
          <p className="text-2xl font-black text-white font-cinzel">{totalMembers}</p>
          <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
            {ativos} Ativos ({Math.round((ativos / (totalMembers || 1)) * 100)}%)
          </span>
        </div>

        {/* Caveiras */}
        <div className="bg-red-950/30 border border-red-900/60 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-red-300 mb-2">
            <span className="text-[11px] font-semibold uppercase">Caveira</span>
            <Skull size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 font-cinzel">{caveiras}</p>
          <span className="text-[10px] text-red-300/80 font-medium mt-1 block">
            Graduação de Elite
          </span>
        </div>

        {/* Subdiretores */}
        <div className="bg-amber-950/30 border border-amber-900/60 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-[11px] font-semibold uppercase">Subdiretor</span>
            <Shield size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-cinzel">{subdiretores}</p>
          <span className="text-[10px] text-amber-300/80 font-medium mt-1 block">
            Liderança Executiva
          </span>
        </div>

        {/* Operacional Regional */}
        <div className="bg-blue-950/30 border border-blue-900/60 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-[11px] font-semibold uppercase">Op. Regional</span>
            <Crosshair size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-cinzel">{operacionais}</p>
          <span className="text-[10px] text-blue-300/80 font-medium mt-1 block">
            Segurança & Escolta
          </span>
        </div>

        {/* Subdiretor / Caveira */}
        <div className="bg-purple-950/30 border border-purple-900/60 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-purple-300 mb-2">
            <span className="text-[11px] font-semibold uppercase">Sub./Caveira</span>
            <Star size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-cinzel">{subdiretoresCaveiras}</p>
          <span className="text-[10px] text-purple-300/80 font-medium mt-1 block">
            Dupla Graduação
          </span>
        </div>

        {/* Divisões */}
        <div className="bg-[#12151c] border border-zinc-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Divisões</span>
            <MapPin size={16} className="text-zinc-300" />
          </div>
          <p className="text-2xl font-black text-white font-cinzel">{divisoes.length}</p>
          <span className="text-[10px] text-zinc-400 font-medium mt-1 block">
            Polos Regionais
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Grupamentos Pie Chart */}
        <div className="bg-[#12151c] border border-zinc-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-cinzel flex items-center gap-2">
              <Skull size={16} className="text-red-500" />
              Distribuição por Grupamento
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Proporção Efetiva</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={grupamentoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {grupamentoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0c0e12" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181c24', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-zinc-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Divisões Bar Chart */}
        <div className="bg-[#12151c] border border-zinc-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-cinzel flex items-center gap-2">
              <MapPin size={16} className="text-amber-500" />
              Efetivo por Divisão Regional
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Membros por Divisão</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisaoData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181c24', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  labelFormatter={(val, items) => items[0]?.payload?.fullName || val}
                />
                <Bar dataKey="integrantes" name="Integrantes" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OFFICIAL ROSTER PRINT SHEET / CENSO */}
      <div className="bg-[#12151c] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5 print-card">
        {/* Official Club Print Header */}
        <div className="border-b-2 border-red-600/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-cinzel font-black text-xl tracking-wider">
                GESTÃO OPERACIONAL SIDNEI
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Relatório Oficial de Efetivo por Grupamentos e Divisões
            </p>
            <p className="text-[11px] text-zinc-500">
              Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-right no-print">
            <span className="text-xs text-zinc-400 font-mono block">
              Total Filtrado: <strong className="text-white font-bold">{filteredRoster.length}</strong> integrantes
            </span>
          </div>
        </div>

        {/* Filters for the Report */}
        <div className="flex flex-wrap items-center gap-3 no-print bg-[#0b0d12] p-3.5 rounded-xl border border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Filter size={14} className="text-red-400" />
            <span>Filtrar Relatório:</span>
          </div>

          {/* Division Filter */}
          <select
            value={filterDivisao}
            onChange={(e) => setFilterDivisao(e.target.value)}
            className="bg-[#181c24] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">Todas as Divisões ({divisoes.length})</option>
            {divisoes.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Grupamento Filter */}
          <select
            value={filterGrupamento}
            onChange={(e) => setFilterGrupamento(e.target.value)}
            className="bg-[#181c24] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">Todos os Grupamentos</option>
            {DEFAULT_GRUPAMENTOS.map((g) => (
              <option key={g.name} value={g.name}>{g.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#181c24] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Em Observação">Em Observação</option>
            <option value="Licença">Licença</option>
            <option value="Honorário">Honorário</option>
          </select>

          {(filterDivisao !== 'all' || filterGrupamento !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setFilterDivisao('all');
                setFilterGrupamento('all');
                setFilterStatus('all');
              }}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Limpar Filtros
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="ml-auto px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5"
          >
            <Printer size={13} />
            <span>Imprimir Quadro</span>
          </button>
        </div>

        {/* Table of Members */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse print-table">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#0e1117] text-zinc-400 uppercase font-semibold">
                <th className="py-3 px-3">Nome de Colete & Nome</th>
                <th className="py-3 px-3">Grupamento</th>
                <th className="py-3 px-3">Divisão</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Data Admissão</th>
                <th className="py-3 px-3">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredRoster.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-2.5 px-3">
                    <strong className="text-white block font-medium">{m.vulgo}</strong>
                    <span className="text-[11px] text-zinc-400">{m.name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <GrupamentoBadge grupamento={m.grupamento} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-medium">
                    {m.divisaoName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'Ativo' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300 font-mono">
                    {formatDateBR(m.entryDate)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-300">
                    {m.phone || '-'}
                  </td>
                </tr>
              ))}

              {filteredRoster.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-zinc-500">
                    Nenhum integrante encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Print Signatures Footer (Visible in print) */}
        <div className="pt-12 hidden print-only">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-t border-black pt-2 font-bold">
                DIRETORIA REGIONAL / COMANDO
              </div>
              <p className="text-[10px] text-zinc-600">Gestão Operacional Sidnei</p>
            </div>
            <div>
              <div className="border-t border-black pt-2 font-bold">
                SUBDIRETORIA / RESPONSÁVEL
              </div>
              <p className="text-[10px] text-zinc-600">Divisão Regional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
