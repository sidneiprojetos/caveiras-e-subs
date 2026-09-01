import React, { useState } from 'react';
import { Printer, Shield, Skull, HeartPulse, MapPin, Phone, Search, Award, Check } from 'lucide-react';
import { Member, Divisao } from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';

interface DigitalIdCardViewProps {
  members: Member[];
  divisoes: Divisao[];
}

export const DigitalIdCardView: React.FC<DigitalIdCardViewProps> = ({
  members,
  divisoes
}) => {
  const [selectedDivisao, setSelectedDivisao] = useState<string>('all');
  const [selectedGrupamento, setSelectedGrupamento] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(m => {
    if (selectedDivisao !== 'all' && m.divisaoId !== selectedDivisao) return false;
    if (selectedGrupamento !== 'all' && m.grupamento !== selectedGrupamento) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchVulgo = m.vulgo.toLowerCase().includes(q);
      const matchColete = m.coleteNumber.toLowerCase().includes(q);
      if (!matchName && !matchVulgo && !matchColete) return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Print Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141720] via-[#1a1e28] to-[#141720] border border-zinc-800 p-6 rounded-2xl shadow-xl no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Identificação & Credenciamento</span>
          </div>
          <h2 className="text-2xl font-black text-white font-cinzel tracking-wide">
            Carteirinhas & Credenciais Digitais
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Credenciais oficiais para porte em viagens, comboios e validação de grupamento e divisão no Insanos M.C.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center gap-2"
        >
          <Printer size={16} />
          Imprimir Cartões / Credenciais
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#11141a] p-4 rounded-xl border border-zinc-800 no-print">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Vulgo, Nome ou Colete..."
            className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
        </div>

        <select
          value={selectedDivisao}
          onChange={(e) => setSelectedDivisao(e.target.value)}
          className="bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 font-medium"
        >
          <option value="all">Todas as Divisões</option>
          {divisoes.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={selectedGrupamento}
          onChange={(e) => setSelectedGrupamento(e.target.value)}
          className="bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500 font-medium"
        >
          <option value="all">Todos os Grupamentos</option>
          <option value="Caveira">Caveira</option>
          <option value="Subdiretor">Subdiretor</option>
          <option value="Operacional Regional">Operacional Regional</option>
          <option value="Subdiretor / Caveira">Subdiretor / Caveira</option>
        </select>
      </div>

      {/* Grid of ID Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="relative bg-gradient-to-b from-[#161a22] via-[#12151b] to-[#0c0e12] border-2 border-zinc-700/80 rounded-2xl p-5 shadow-2xl overflow-hidden print-card"
          >
            {/* Top Red & Gold Accent Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>

            {/* Club Watermark Badge Background */}
            <div className="absolute -right-8 -bottom-8 opacity-5 text-white pointer-events-none">
              <Skull size={180} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-red-950/80 border border-red-800 flex items-center justify-center text-red-500 font-cinzel font-black text-xs">
                  IMC
                </div>
                <div>
                  <h4 className="text-xs font-black text-white font-cinzel tracking-wider">
                    INSANOS M.C.
                  </h4>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest">
                    Credencial Oficial de Estrada
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-zinc-800">
                {member.coleteNumber}
              </span>
            </div>

            {/* Member Info & Photo */}
            <div className="flex gap-4 items-center">
              <img
                src={member.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                alt={member.vulgo}
                className="w-20 h-24 rounded-xl object-cover border-2 border-red-600/80 shadow-md shrink-0 bg-zinc-800"
              />

              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-base font-black text-white font-cinzel truncate leading-tight">
                  {member.vulgo}
                </p>
                <p className="text-[11px] text-zinc-300 truncate font-medium">
                  {member.name}
                </p>

                <div className="pt-0.5">
                  <GrupamentoBadge grupamento={member.grupamento} size="sm" />
                </div>
              </div>
            </div>

            {/* Details Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-black/40 p-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[9px] text-zinc-500 block uppercase">Divisão</span>
                <span className="font-bold text-zinc-200 truncate block text-[11px]">
                  {member.divisaoName}
                </span>
              </div>

              <div className="bg-black/40 p-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[9px] text-zinc-500 block uppercase">Sangue</span>
                <span className="font-bold text-red-500 font-mono text-[12px]">
                  {member.bloodType}
                </span>
              </div>

              <div className="bg-black/40 p-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[9px] text-zinc-500 block uppercase">Entrada</span>
                <span className="font-bold text-zinc-300 font-mono text-[10px]">
                  {new Date(member.entryDate).getFullYear()}
                </span>
              </div>
            </div>

            {/* Machine & Emergency footnote */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <span className="truncate">
                🏍️ {member.motorcycle?.brand} {member.motorcycle?.model || ''} ({member.motorcycle?.plate || 'S/P'})
              </span>
              <span className="font-mono text-emerald-400 font-bold shrink-0 ml-2">
                {member.status}
              </span>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-[#12151c] rounded-2xl border border-zinc-800">
            Nenhum integrante correspondente para gerar credencial.
          </div>
        )}
      </div>
    </div>
  );
};
