import React, { useState } from 'react';
import { Plus, MapPin, Users, Calendar, Shield, Edit2, Trash2, Check, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { Divisao, Member } from '../types';
import { addActivityLog } from '../data/initialData';

interface DivisionManagerProps {
  divisoes: Divisao[];
  members: Member[];
  onAddDivisao: (divisao: Divisao) => void;
  onUpdateDivisao: (divisao: Divisao) => void;
  onDeleteDivisao: (divisaoId: string) => void;
  onSelectDivisionFilter: (divisaoId: string) => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const DivisionManager: React.FC<DivisionManagerProps> = ({
  divisoes,
  members,
  onAddDivisao,
  onUpdateDivisao,
  onDeleteDivisao,
  onSelectDivisionFilter,
  isAdmin,
  onRequireAdmin
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivisao, setEditingDivisao] = useState<Divisao | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('PR');
  const [regionalDirector, setRegionalDirector] = useState('');
  const [subDirector, setSubDirector] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const openAddModal = () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingDivisao(null);
    setName('');
    setCity('');
    setState('PR');
    setRegionalDirector('');
    setSubDirector('');
    setMeetingSchedule('');
    setMeetingLocation('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (div: Divisao) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingDivisao(div);
    setName(div.name);
    setCity(div.city);
    setState(div.state);
    setRegionalDirector(div.regionalDirector || '');
    setSubDirector(div.subDirector || '');
    setMeetingSchedule(div.meetingSchedule || '');
    setMeetingLocation(div.meetingLocation || '');
    setDescription(div.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da divisão é obrigatório.');
      return;
    }

    const divisionData: Divisao = {
      id: editingDivisao ? editingDivisao.id : `div-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name: name.trim(),
      city: city.trim() || name.trim(),
      state: state.trim() || 'PR',
      regionalDirector: regionalDirector.trim() || undefined,
      subDirector: subDirector.trim() || undefined,
      meetingSchedule: meetingSchedule.trim() || undefined,
      meetingLocation: meetingLocation.trim() || undefined,
      description: description.trim() || undefined,
      createdDate: editingDivisao ? editingDivisao.createdDate : new Date().toISOString().split('T')[0],
      active: true
    };

    if (editingDivisao) {
      onUpdateDivisao(divisionData);
      addActivityLog('DIVISAO', divisionData.name, `Divisão "${divisionData.name}" atualizada.`);
    } else {
      onAddDivisao(divisionData);
      addActivityLog('DIVISAO', divisionData.name, `Nova divisão "${divisionData.name}" criada com sucesso.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (div: Divisao) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    const memberCount = members.filter(m => m.divisaoId === div.id).length;
    if (memberCount > 0) {
      alert(`Não é possível excluir a divisão "${div.name}" pois existem ${memberCount} integrante(s) vinculados a ela. Transfira os integrantes antes de excluir.`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir permanentemente a divisão "${div.name}"?`)) {
      onDeleteDivisao(div.id);
      addActivityLog('EXCLUSAO', div.name, `Divisão "${div.name}" removida do sistema.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#151922] via-[#1a1f2c] to-[#151922] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-red-400">Estrutura Territorial</span>
          </div>
          <h2 className="text-2xl font-black text-white font-cinzel tracking-wide">
            Divisões do Insanos M.C.
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Gerenciamento das divisões regionais (Umuarama Oeste, Leste, Cianorte, Cidade Gaúcha, Campo Mourão, Goioerê e novas expansões).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="self-start md:self-center px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center gap-2"
        >
          <Plus size={16} />
          Cadastrar Nova Divisão
        </button>
      </div>

      {/* Grid of Divisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {divisoes.map((div) => {
          const divMembers = members.filter(m => m.divisaoId === div.id);
          const caveiras = divMembers.filter(m => m.grupamento.includes('Caveira')).length;
          const subdiretores = divMembers.filter(m => m.grupamento.includes('Subdiretor')).length;
          const operacionais = divMembers.filter(m => m.grupamento.includes('Operacional')).length;

          return (
            <div
              key={div.id}
              className="bg-[#12151c] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-950/70 border border-red-800/80 flex items-center justify-center text-red-400">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-cinzel group-hover:text-red-400 transition">
                          {div.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          {div.city} - {div.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(div)}
                          title="Editar Divisão"
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(div)}
                          title="Excluir Divisão"
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {div.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed bg-[#0c0e12] p-2.5 rounded-lg border border-zinc-800/60">
                    {div.description}
                  </p>
                )}

                {/* Leadership Info */}
                <div className="space-y-1.5 text-xs text-zinc-300">
                  {div.regionalDirector && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Diretoria Regional:</span>
                      <span className="font-semibold text-zinc-200">{div.regionalDirector}</span>
                    </div>
                  )}
                  {div.subDirector && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Subdiretoria:</span>
                      <span className="font-semibold text-zinc-200">{div.subDirector}</span>
                    </div>
                  )}
                  {div.meetingSchedule && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Reunião / Encontro:</span>
                      <span className="text-amber-400/90 font-medium">{div.meetingSchedule}</span>
                    </div>
                  )}
                </div>

                {/* Stats Breakdown Pill */}
                <div className="grid grid-cols-3 gap-2 bg-[#0a0c10] p-2.5 rounded-xl border border-zinc-800/80 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Total</span>
                    <span className="text-sm font-extrabold text-white">{divMembers.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-400 block">Caveiras</span>
                    <span className="text-sm font-bold text-red-300">{caveiras}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-400 block">Oper./Sub</span>
                    <span className="text-sm font-bold text-blue-300">{operacionais + subdiretores}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {divMembers.length === 1 ? '1 Integrante cadastrado' : `${divMembers.length} Integrantes`}
                </span>

                <button
                  onClick={() => onSelectDivisionFilter(div.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition"
                >
                  <span>Ver Integrantes</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Division */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#11141a] border border-zinc-700/80 rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-950/70 border border-red-800 flex items-center justify-center text-red-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-cinzel">
                    {editingDivisao ? 'Editar Divisão' : 'Cadastrar Nova Divisão'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Insanos M.C. Noroeste Paranaense & Expansão
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nome da Divisão <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Umuarama Norte, Maringá, Paranavaí"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="PR"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cidade Sede
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Umuarama, Cianorte, etc."
                  className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Diretor Regional Responsável
                  </label>
                  <input
                    type="text"
                    value={regionalDirector}
                    onChange={(e) => setRegionalDirector(e.target.value)}
                    placeholder="Ex: Caveira Sidnei"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Subdiretor da Divisão
                  </label>
                  <input
                    type="text"
                    value={subDirector}
                    onChange={(e) => setSubDirector(e.target.value)}
                    placeholder="Ex: Subdiretor Marreta"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Dia / Horário dos Encontros
                  </label>
                  <input
                    type="text"
                    value={meetingSchedule}
                    onChange={(e) => setMeetingSchedule(e.target.value)}
                    placeholder="Ex: Quintas-feiras às 20h"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Local do Ponto de Apoio / Sede
                  </label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="Ex: Sede Regional Central"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição & Notas Territoriais
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informações sobre a divisão, área de abrangência ou histórico..."
                  className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md"
                >
                  {editingDivisao ? 'Salvar Divisão' : 'Criar Divisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
