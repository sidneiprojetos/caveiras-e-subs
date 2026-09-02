import React, { useState } from 'react';
import { 
  Search, Filter, Plus, LayoutGrid, List, Phone, MapPin, 
  Calendar, Edit3, Trash2, Eye, Shield, Skull, ArrowUpDown, Printer
} from 'lucide-react';
import { Member, Divisao, DEFAULT_GRUPAMENTOS } from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';
import { ConfirmDeleteModal, DeleteTargetInfo } from './ConfirmDeleteModal';
import { printRosterReport, printMemberDossier } from '../utils/printService';

interface MemberListProps {
  members: Member[];
  divisoes: Divisao[];
  onOpenAddMember: () => void;
  onSelectMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
  currentDivisionFilter: string;
  onDivisionFilterChange: (divId: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  divisoes,
  onOpenAddMember,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  isAdmin,
  onRequireAdmin,
  currentDivisionFilter,
  onDivisionFilterChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [grupamentoFilter, setGrupamentoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'vulgo' | 'name' | 'coleteNumber' | 'entryDate' | 'divisaoName'>('vulgo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Filter and sort
  const filteredMembers = members.filter((m) => {
    // Division filter
    if (currentDivisionFilter !== 'all' && m.divisaoId !== currentDivisionFilter) return false;
    // Grupamento filter
    if (grupamentoFilter !== 'all' && m.grupamento !== grupamentoFilter) return false;
    // Status filter
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchVulgo = m.vulgo.toLowerCase().includes(q);
      const matchColete = m.coleteNumber.toLowerCase().includes(q);
      const matchCity = m.divisaoName?.toLowerCase().includes(q);
      if (!matchName && !matchVulgo && !matchColete && !matchCity) return false;
    }
    return true;
  }).sort((a, b) => {
    let fieldA = a[sortBy] || '';
    let fieldB = b[sortBy] || '';
    if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
    if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();
    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getCleanPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`;
  };

  const handleAddClick = () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    onOpenAddMember();
  };

  const handleEditClick = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    onEditMember(m);
  };

  const handleDeleteClick = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setMemberToDelete(m);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const activeFiltersCount = 
    (currentDivisionFilter !== 'all' ? 1 : 0) +
    (grupamentoFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    onDivisionFilterChange('all');
    setGrupamentoFilter('all');
    setStatusFilter('all');
    setSearch('');
  };

  const handlePrintList = () => {
    let title = 'Lista de Integrantes';
    if (currentDivisionFilter !== 'all') {
      const d = divisoes.find(div => div.id === currentDivisionFilter);
      if (d) title = `Integrantes - Divisão ${d.name}`;
    }
    if (grupamentoFilter !== 'all') {
      title += ` (${grupamentoFilter})`;
    }
    printRosterReport(filteredMembers, title);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#12151c] border border-zinc-800 p-4 lg:p-5 rounded-2xl shadow-xl">
        {/* Search Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Vulgo, Nome, Colete, Divisão..."
            className="w-full bg-[#0c0e12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode, Print & Add Member Button */}
        <div className="flex items-center gap-2.5 self-end lg:self-center">
          <button
            type="button"
            onClick={handlePrintList}
            title="Imprimir Listagem Atual"
            className="p-2.5 rounded-xl bg-[#0c0e12] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Printer size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <div className="flex items-center bg-[#0c0e12] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Visualização em Grade"
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Visualização em Tabela"
              className={`p-2 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={handleAddClick}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Cadastrar Integrante</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-[#101319] border border-zinc-800/80 p-3.5 rounded-xl flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] mr-1">
          <Filter size={13} className="text-red-400" />
          <span>Filtros:</span>
        </div>

        {/* Divisão Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#0c0e12] px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 text-[11px]">Divisão:</span>
          <select
            value={currentDivisionFilter}
            onChange={(e) => onDivisionFilterChange(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#12151c]">Todas as Divisões ({divisoes.length})</option>
            {divisoes.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#12151c]">{d.name}</option>
            ))}
          </select>
        </div>

        {/* Grupamento Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#0c0e12] px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 text-[11px]">Grupamento:</span>
          <select
            value={grupamentoFilter}
            onChange={(e) => setGrupamentoFilter(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#12151c]">Todos os Grupamentos</option>
            {DEFAULT_GRUPAMENTOS.map((g) => (
              <option key={g.name} value={g.name} className="bg-[#12151c]">{g.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-[#0c0e12] px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#12151c]">Todos os Status</option>
            <option value="Ativo" className="bg-[#12151c]">Ativo</option>
            <option value="Em Observação" className="bg-[#12151c]">Em Observação</option>
            <option value="Licença" className="bg-[#12151c]">Licença</option>
            <option value="Honorário" className="bg-[#12151c]">Honorário</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 bg-[#0c0e12] px-3 py-1.5 rounded-lg border border-zinc-800 ml-auto">
          <span className="text-zinc-500 text-[11px]">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="vulgo" className="bg-[#12151c]">Vulgo (Nome de Guerra)</option>
            <option value="name" className="bg-[#12151c]">Nome Completo</option>
            <option value="coleteNumber" className="bg-[#12151c]">Número do Colete</option>
            <option value="divisaoName" className="bg-[#12151c]">Divisão</option>
            <option value="entryDate" className="bg-[#12151c]">Data de Entrada</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title="Alternar ordem crescente/decrescente"
            className="p-0.5 text-zinc-400 hover:text-white"
          >
            <ArrowUpDown size={12} />
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="text-[11px] text-red-400 hover:text-red-300 underline font-semibold ml-2"
          >
            Limpar ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>
          Mostrando <strong className="text-white font-bold">{filteredMembers.length}</strong> de {members.length} integrantes
        </span>
        {!isAdmin && (
          <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
            🔒 Modo Leitura (Desbloqueie Admin para cadastrar ou editar)
          </span>
        )}
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="bg-[#12151c] border border-zinc-800 hover:border-red-600/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:shadow-red-950/30 hover:scale-[1.01] relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:via-amber-500 group-hover:to-red-700 transition"></div>

              <div className="space-y-4">
                {/* Header with Insignia Emblem, Vulgo & Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1c2230] to-[#0c0e14] border-2 border-red-600/80 shadow-md flex items-center justify-center text-red-400 group-hover:border-red-500 group-hover:shadow-red-900/50 transition">
                      {member.grupamento === 'Caveira' && <Skull size={28} className="text-red-500" />}
                      {member.grupamento === 'Subdiretor' && <Shield size={28} className="text-amber-500" />}
                      {member.grupamento === 'Operacional Regional' && <Shield size={28} className="text-blue-500" />}
                      {member.grupamento === 'Subdiretor / Caveira' && <Skull size={28} className="text-purple-400" />}
                      {member.grupamento !== 'Caveira' && member.grupamento !== 'Subdiretor' && member.grupamento !== 'Operacional Regional' && member.grupamento !== 'Subdiretor / Caveira' && (
                        <Shield size={28} className="text-zinc-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-amber-400">
                        {member.coleteNumber}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        member.status === 'Ativo' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' : 'text-amber-400 bg-amber-950/60 border border-amber-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white font-cinzel truncate group-hover:text-red-400 transition leading-tight mt-0.5">
                      {member.vulgo}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">{member.name}</p>

                    <div className="pt-1.5">
                      <GrupamentoBadge grupamento={member.grupamento} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Division and Dates pill */}
                <div className="bg-[#0b0d12] p-3 rounded-xl border border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1 text-zinc-400 text-[11px]">
                      <MapPin size={12} className="text-red-400" />
                      Divisão:
                    </span>
                    <span className="font-semibold text-white truncate max-w-[150px]">{member.divisaoName}</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1 text-zinc-400 text-[11px]">
                      <Calendar size={12} className="text-amber-400" />
                      No MC desde:
                    </span>
                    <span className="font-medium text-zinc-300">
                      {new Date(member.entryDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons at bottom */}
              <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {member.phone && (
                    <a
                      href={`https://wa.me/${getCleanPhone(member.phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Conversar no WhatsApp"
                      className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 transition"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {member.phone || 'Sem telefone'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      printMemberDossier(member);
                    }}
                    title="Imprimir Dossiê do Integrante"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition"
                  >
                    <Printer size={13} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMember(member);
                    }}
                    title="Ver Dossiê Completo"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  >
                    <Eye size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleEditClick(member, e)}
                    title={isAdmin ? "Editar Integrante" : "Editar Integrante (Requer PIN Admin)"}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(member, e)}
                    title={isAdmin ? "Excluir Integrante" : "Excluir Integrante (Requer PIN Admin)"}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-[#12151c] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0e1117] text-zinc-400 uppercase font-semibold">
                  <th className="py-3 px-4">Colete</th>
                  <th className="py-3 px-4">Vulgo / Integrante</th>
                  <th className="py-3 px-4">Grupamento</th>
                  <th className="py-3 px-4">Divisão</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Entrada no MC</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    className="hover:bg-zinc-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {m.coleteNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#181c24] border border-red-600/70 flex items-center justify-center text-red-400 shrink-0">
                          {m.grupamento === 'Caveira' && <Skull size={16} className="text-red-500" />}
                          {m.grupamento === 'Subdiretor' && <Shield size={16} className="text-amber-500" />}
                          {m.grupamento === 'Operacional Regional' && <Shield size={16} className="text-blue-500" />}
                          {m.grupamento === 'Subdiretor / Caveira' && <Skull size={16} className="text-purple-400" />}
                          {m.grupamento !== 'Caveira' && m.grupamento !== 'Subdiretor' && m.grupamento !== 'Operacional Regional' && m.grupamento !== 'Subdiretor / Caveira' && (
                            <Shield size={16} className="text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <strong className="text-white block font-semibold group-hover:text-red-400 transition font-cinzel">
                            {m.vulgo}
                          </strong>
                          <span className="text-[11px] text-zinc-400 block">{m.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <GrupamentoBadge grupamento={m.grupamento} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-zinc-200 font-medium">
                      {m.divisaoName}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Ativo' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      {new Date(m.entryDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {m.phone && (
                          <a
                            href={`https://wa.me/${getCleanPhone(m.phone)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 transition"
                            title="WhatsApp"
                          >
                            <Phone size={13} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => printMemberDossier(m)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition"
                          title="Imprimir Dossiê"
                        >
                          <Printer size={13} />
                        </button>

                        <button
                          onClick={() => onSelectMember(m)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                          title="Ver Ficha"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleEditClick(m, e)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition"
                          title={isAdmin ? "Editar" : "Editar (Requer PIN Admin)"}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(m, e)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition"
                          title={isAdmin ? "Excluir" : "Excluir (Requer PIN Admin)"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="bg-[#12151c] border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Skull size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-cinzel">Nenhum integrante encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Não encontramos nenhum registro com os filtros atuais selecionados.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md"
            >
              Cadastrar Novo
            </button>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        target={
          memberToDelete
            ? {
                type: 'member',
                id: memberToDelete.id,
                title: `${memberToDelete.vulgo} (${memberToDelete.name})`,
                subtitle: `Colete: ${memberToDelete.coleteNumber || 'S/N'} • Divisão: ${memberToDelete.divisaoName} • Grupamento: ${memberToDelete.grupamento}`,
                warning: `Tem certeza que deseja excluir o cadastro de ${memberToDelete.vulgo}? Esta ação não pode ser desfeita.`
              }
            : null
        }
      />
    </div>
  );
};
