import React, { useState, useEffect } from 'react';
import { X, User, Shield, Phone, HeartPulse, Bike, Calendar, FileText, Check, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Member, Divisao, BloodType, MemberStatus, DEFAULT_GRUPAMENTOS } from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  memberToEdit?: Member | null;
  divisoes: Divisao[];
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
  divisoes
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'grupamento' | 'moto' | 'emergencia'>('geral');
  
  const [name, setName] = useState('');
  const [vulgo, setVulgo] = useState('');
  const [coleteNumber, setColeteNumber] = useState('');
  const [grupamento, setGrupamento] = useState<string>('Caveira');
  const [customGrupamento, setCustomGrupamento] = useState('');
  const [divisaoId, setDivisaoId] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Ativo');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [graduationDate, setGraduationDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [observations, setObservations] = useState('');

  // Emergency contact
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [emergRel, setEmergRel] = useState('Esposa');

  // Motorcycle
  const [motoBrand, setMotoBrand] = useState('Harley-Davidson');
  const [motoModel, setMotoModel] = useState('');
  const [motoCc, setMotoCc] = useState('');
  const [motoPlate, setMotoPlate] = useState('');
  const [motoYear, setMotoYear] = useState('');

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setVulgo(memberToEdit.vulgo || '');
      setColeteNumber(memberToEdit.coleteNumber || '');
      
      const isPredefined = DEFAULT_GRUPAMENTOS.some(g => g.name === memberToEdit.grupamento);
      if (isPredefined) {
        setGrupamento(memberToEdit.grupamento);
        setCustomGrupamento('');
      } else {
        setGrupamento('Outro');
        setCustomGrupamento(memberToEdit.grupamento);
      }

      setDivisaoId(memberToEdit.divisaoId || (divisoes[0]?.id || ''));
      setStatus(memberToEdit.status || 'Ativo');
      setPhone(memberToEdit.phone || '');
      setEmail(memberToEdit.email || '');
      setBloodType(memberToEdit.bloodType || 'O+');
      setEntryDate(memberToEdit.entryDate || '');
      setGraduationDate(memberToEdit.grupamentoGraduationDate || '');
      setAvatarUrl(memberToEdit.avatarUrl || '');
      setObservations(memberToEdit.observations || '');

      setEmergName(memberToEdit.emergencyContact?.name || '');
      setEmergPhone(memberToEdit.emergencyContact?.phone || '');
      setEmergRel(memberToEdit.emergencyContact?.relationship || 'Esposa');

      setMotoBrand(memberToEdit.motorcycle?.brand || 'Harley-Davidson');
      setMotoModel(memberToEdit.motorcycle?.model || '');
      setMotoCc(memberToEdit.motorcycle?.engineCc || '');
      setMotoPlate(memberToEdit.motorcycle?.plate || '');
      setMotoYear(memberToEdit.motorcycle?.year || '');
    } else {
      // Defaults for new member
      setName('');
      setVulgo('');
      setColeteNumber(`IMC-${Math.floor(1000 + Math.random() * 9000)}`);
      setGrupamento('Caveira');
      setCustomGrupamento('');
      setDivisaoId(divisoes[0]?.id || '');
      setStatus('Ativo');
      setPhone('');
      setEmail('');
      setBloodType('O+');
      setEntryDate(new Date().toISOString().split('T')[0]);
      setGraduationDate(new Date().toISOString().split('T')[0]);
      setAvatarUrl(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
      setObservations('');
      setEmergName('');
      setEmergPhone('');
      setEmergRel('Esposa');
      setMotoBrand('Harley-Davidson');
      setMotoModel('');
      setMotoCc('');
      setMotoPlate('');
      setMotoYear('2023');
    }
    setFormError('');
    setActiveTab('geral');
  }, [memberToEdit, isOpen, divisoes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !vulgo.trim()) {
      setFormError('Preencha o Nome Completo e o Vulgo (Apelido no MC).');
      setActiveTab('geral');
      return;
    }

    if (!divisaoId) {
      setFormError('Selecione uma Divisão.');
      setActiveTab('geral');
      return;
    }

    const selectedDivisao = divisoes.find(d => d.id === divisaoId);
    const finalGrupamento = grupamento === 'Outro' ? (customGrupamento.trim() || 'Integrante') : grupamento;

    const newMember: Member = {
      id: memberToEdit ? memberToEdit.id : `mem-${Date.now()}`,
      name: name.trim(),
      vulgo: vulgo.trim(),
      coleteNumber: coleteNumber.trim() || `IMC-${Math.floor(1000 + Math.random() * 9000)}`,
      grupamento: finalGrupamento,
      divisaoId,
      divisaoName: selectedDivisao ? selectedDivisao.name : 'Regional',
      status,
      phone: phone.trim(),
      email: email.trim(),
      bloodType,
      emergencyContact: {
        name: emergName.trim(),
        phone: emergPhone.trim(),
        relationship: emergRel.trim()
      },
      motorcycle: {
        brand: motoBrand.trim(),
        model: motoModel.trim(),
        engineCc: motoCc.trim(),
        plate: motoPlate.trim().toUpperCase(),
        year: motoYear.trim()
      },
      entryDate,
      grupamentoGraduationDate: graduationDate || undefined,
      avatarUrl: avatarUrl || AVATAR_PRESETS[0],
      observations: observations.trim(),
      createdAt: memberToEdit ? memberToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#11141a] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#181c24] border-b border-zinc-800 flex items-center justify-between relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/70 border border-red-800/80 flex items-center justify-center text-red-400 font-bold text-lg font-cinzel">
              IMC
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-cinzel tracking-wide">
                {memberToEdit ? 'Editar Integrante do Insanos M.C.' : 'Cadastrar Novo Integrante'}
              </h2>
              <p className="text-xs text-zinc-400">
                {memberToEdit ? `Atualização de cadastro de ${memberToEdit.vulgo}` : 'Registro no quadro oficial de grupamentos e divisões'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800 bg-[#0e1015] px-6 gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User size={15} />
            1. Dados Pessoais & Vulgo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grupamento')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'grupamento'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield size={15} />
            2. Grupamento & Divisão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('moto')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'moto'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bike size={15} />
            3. Moto & Equipamento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergencia')}
            className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'emergencia'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HeartPulse size={15} />
            4. Saúde & Emergência
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-zinc-100">
          {formError && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* TAB 1: GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Vulgo / Apelido no M.C. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vulgo}
                    onChange={(e) => setVulgo(e.target.value)}
                    placeholder="Ex: Caveira Sidnei, Marreta, Falcão"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-hidden focus:border-red-500"
                    required
                  />
                  <span className="text-[11px] text-zinc-500">Nome de estrada gravado no colete</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo do integrante"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Número do Colete / Matrícula
                  </label>
                  <input
                    type="text"
                    value={coleteNumber}
                    onChange={(e) => setColeteNumber(e.target.value)}
                    placeholder="Ex: IMC-0142"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-amber-400 font-bold focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (44) 99874-1234"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Status do Integrante
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MemberStatus)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="Ativo">Ativo (Rodando / Frequente)</option>
                    <option value="Em Observação">Em Observação</option>
                    <option value="Licença">Licença Temporária</option>
                    <option value="Honorário">Honorário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Data de Entrada no Insanos M.C.
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              {/* Avatar Photo Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-red-400" />
                    Foto / Avatar do Colete
                  </span>
                  <span className="text-[11px] text-zinc-400 font-normal">Selecione um preset ou insira URL</span>
                </label>

                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={avatarUrl || AVATAR_PRESETS[0]}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-red-600/80 shadow-md shrink-0 bg-zinc-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                    }}
                  />
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="URL personalizada da foto (ou clique nos modelos abaixo)"
                    className="flex-1 bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                        avatarUrl === preset ? 'border-red-500 ring-2 ring-red-500/40 scale-105' : 'border-zinc-700 hover:border-zinc-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRUPAMENTO & DIVISÃO */}
          {activeTab === 'grupamento' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Grupamento Oficial do Integrante <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_GRUPAMENTOS.map((g) => {
                    const isSelected = grupamento === g.name;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => setGrupamento(g.name)}
                        className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                          isSelected
                            ? `${g.badgeBg} ${g.borderColor} border-2 shadow-lg`
                            : 'bg-[#0c0e12] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="pt-0.5">
                          <GrupamentoBadge grupamento={g.name} size="sm" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white mb-0.5">{g.name}</p>
                          <p className="text-[11px] text-zinc-400 leading-tight">{g.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="radio"
                      checked={grupamento === 'Outro'}
                      onChange={() => setGrupamento('Outro')}
                      className="accent-red-500"
                    />
                    <span>Outro Grupamento / Posição Personalizada</span>
                  </label>
                  {grupamento === 'Outro' && (
                    <input
                      type="text"
                      value={customGrupamento}
                      onChange={(e) => setCustomGrupamento(e.target.value)}
                      placeholder="Especifique o grupamento ou função"
                      className="mt-2 w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Divisão de Lotação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={divisaoId}
                    onChange={(e) => setDivisaoId(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500 font-semibold"
                    required
                  >
                    {divisoes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.city} - {d.state})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Novas divisões podem ser cadastradas na aba "Divisões"
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Data de Graduação / Promoção no Grupamento
                  </label>
                  <input
                    type="date"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Data em que conquistou o brevê/grupamento atual
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Observações de Disciplina & Histórico
                </label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Anotações internas, histórico de viagens, cargos prévios ou atribuições especiais..."
                  className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500"
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 3: MOTO */}
          {activeTab === 'moto' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl flex items-center gap-3">
                <Bike size={24} className="text-amber-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Dados da Máquina / Rodagem</p>
                  <p className="text-zinc-400">Informações essenciais para segurança em comboios e eventos.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Marca da Motocicleta
                  </label>
                  <select
                    value={motoBrand}
                    onChange={(e) => setMotoBrand(e.target.value)}
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  >
                    <option value="Harley-Davidson">Harley-Davidson</option>
                    <option value="BMW">BMW</option>
                    <option value="Triumph">Triumph</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Ducati">Ducati</option>
                    <option value="Royal Enfield">Royal Enfield</option>
                    <option value="Indian">Indian</option>
                    <option value="Outra">Outra Marca</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Modelo da Moto
                  </label>
                  <input
                    type="text"
                    value={motoModel}
                    onChange={(e) => setMotoModel(e.target.value)}
                    placeholder="Ex: Fat Boy 114, R 1250 GS, Tiger 1200"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cilindrada
                  </label>
                  <input
                    type="text"
                    value={motoCc}
                    onChange={(e) => setMotoCc(e.target.value)}
                    placeholder="Ex: 1868cc, 1254cc"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    value={motoPlate}
                    onChange={(e) => setMotoPlate(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC-1234 ou BRA2E19"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm font-mono uppercase text-amber-300 font-bold focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ano de Fabricação
                  </label>
                  <input
                    type="text"
                    value={motoYear}
                    onChange={(e) => setMotoYear(e.target.value)}
                    placeholder="Ex: 2022"
                    className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCIA & SAÚDE */}
          {activeTab === 'emergencia' && (
            <div className="space-y-4">
              <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-xl flex items-center gap-3">
                <HeartPulse size={24} className="text-red-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-red-200">Ficha Médica Rápida de Estrada</p>
                  <p className="text-red-300/80">Esses dados constam na carteirinha digital de emergência do irmão.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tipo Sanguíneo / Fator RH
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodType[]).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setBloodType(bt)}
                      className={`py-2 rounded-lg font-bold text-xs border transition ${
                        bloodType === bt
                          ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900'
                          : 'bg-[#0c0e12] border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Contato Direto de Emergência
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Nome do Contato
                    </label>
                    <input
                      type="text"
                      value={emergName}
                      onChange={(e) => setEmergName(e.target.value)}
                      placeholder="Ex: Mariana Alves"
                      className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Telefone de Emergência
                    </label>
                    <input
                      type="text"
                      value={emergPhone}
                      onChange={(e) => setEmergPhone(e.target.value)}
                      placeholder="Ex: (44) 99123-5566"
                      className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Grau de Parentesco
                    </label>
                    <input
                      type="text"
                      value={emergRel}
                      onChange={(e) => setEmergRel(e.target.value)}
                      placeholder="Ex: Esposa, Mãe, Irmão"
                      className="w-full bg-[#0c0e12] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-xs transition"
            >
              Cancelar
            </button>

            <div className="flex gap-2">
              {activeTab !== 'emergencia' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'geral') setActiveTab('grupamento');
                    else if (activeTab === 'grupamento') setActiveTab('moto');
                    else if (activeTab === 'moto') setActiveTab('emergencia');
                  }}
                  className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg text-xs transition"
                >
                  Próxima Etapa →
                </button>
              ) : null}

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/80 flex items-center gap-2"
              >
                <Check size={16} />
                {memberToEdit ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
