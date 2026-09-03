import React, { useState } from 'react';
import { X, Phone, Calendar, Shield, Skull, MapPin, Edit3, Trash2, Printer, Award, Mail } from 'lucide-react';
import { Member, MemberStatusConfig } from '../types';
import { GrupamentoBadge } from './GrupamentoBadge';
import { MemberStatusBadge } from './MemberStatusBadge';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { printMemberDossier } from '../utils/printService';
import { formatDateBR, calculateYearsInClub } from '../utils/dateUtils';

interface MemberDetailModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onDelete: (memberId: string) => void;
  isAdmin: boolean;
  onRequireAdmin?: () => void;
  statuses?: MemberStatusConfig[];
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isAdmin,
  onRequireAdmin,
  statuses
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    printMemberDossier(member);
  };

  const getCleanPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`;
  };

  const handleEditClick = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    onEdit(member);
  };

  const handleDeleteClick = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(member.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  const yearsInClub = calculateYearsInClub(member.entryDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-[#11141a] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top bar */}
        <div className="px-6 py-4 bg-[#181c24] border-b border-zinc-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
              {member.divisaoName}
            </span>
            <span className="text-xs text-zinc-400">Dossiê do Integrante</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir Ficha Cadastral"
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition text-xs flex items-center gap-1.5 px-2.5"
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleEditClick}
              title={isAdmin ? "Editar Dossiê" : "Editar (Requer PIN Admin)"}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition text-xs flex items-center gap-1.5 px-2.5"
            >
              <Edit3 size={14} />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              title={isAdmin ? "Excluir Dossiê" : "Excluir (Requer PIN Admin)"}
              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-400 transition text-xs flex items-center gap-1.5 px-2.5 border border-red-800/60"
            >
              <Trash2 size={14} />
              <span>Excluir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-zinc-100">
          {/* Header Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-zinc-800">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1c2230] via-[#121620] to-[#0a0c10] border-2 border-red-600 shadow-xl flex flex-col items-center justify-center p-2 text-center">
                {member.grupamento === 'Caveira' && <Skull size={40} className="text-red-500" />}
                {member.grupamento === 'Subdiretor' && <Shield size={40} className="text-amber-500" />}
                {member.grupamento === 'Operacional Regional' && <Shield size={40} className="text-blue-500" />}
                {member.grupamento === 'Subdiretor / Caveira' && <Skull size={40} className="text-purple-400" />}
                {member.grupamento !== 'Caveira' && member.grupamento !== 'Subdiretor' && member.grupamento !== 'Operacional Regional' && member.grupamento !== 'Subdiretor / Caveira' && (
                  <Shield size={40} className="text-zinc-400" />
                )}
              </div>
              <div className="absolute -bottom-2.5 -right-2 shadow-lg">
                <MemberStatusBadge status={member.status} statuses={statuses} size="sm" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-white font-cinzel tracking-wide">
                    {member.vulgo}
                  </h1>
                  <p className="text-sm text-zinc-300 font-medium">{member.name}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-1.5 justify-center">
                  <GrupamentoBadge grupamento={member.grupamento} size="md" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                  <MapPin size={13} className="text-red-400" />
                  Divisão: <strong className="text-white">{member.divisaoName}</strong>
                </span>

                <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                  <Calendar size={13} className="text-amber-400" />
                  Desde: <strong className="text-white">{formatDateBR(member.entryDate)}</strong>
                  {yearsInClub !== null && (
                    <span className="text-[11px] text-amber-400 font-bold">({yearsInClub} {yearsInClub === 1 ? 'ano' : 'anos'} de MC)</span>
                  )}
                </span>

                {member.grupamentoGraduationDate && (
                  <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/60">
                    <Award size={13} className="text-purple-400" />
                    Graduação: <strong className="text-white">{formatDateBR(member.grupamentoGraduationDate)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#151921] border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">Contato Telefônico</span>
                <span className="text-sm font-semibold text-white">{member.phone || 'Não informado'}</span>
              </div>
              {member.phone && (
                <a
                  href={`https://wa.me/${getCleanPhone(member.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Phone size={13} />
                  WhatsApp
                </a>
              )}
            </div>

            <div className="bg-[#151921] border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">E-mail Cadastrado</span>
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">{member.email || 'Não informado'}</span>
              </div>
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Mail size={13} />
                  Enviar
                </a>
              )}
            </div>
          </div>

          {/* Observations & History */}
          {member.observations && (
            <div className="bg-[#151921] border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Histórico & Observações Disciplinares
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#0c0e12] p-3 rounded-lg border border-zinc-800/80">
                {member.observations}
              </p>
            </div>
          )}

          {/* Digital Card Preview */}
          <div className="bg-gradient-to-r from-zinc-900 via-[#181a20] to-zinc-900 border border-zinc-700/80 rounded-xl p-4 space-y-3 print-card">
            <div className="flex items-center justify-between text-xs">
              <span className="font-cinzel font-bold text-red-500 tracking-wider">GESTÃO OPERACIONAL SIDNEI</span>
              <span className="font-mono text-zinc-400">ID REGISTRO #{member.id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-lg font-black text-white font-cinzel">{member.vulgo}</p>
                <p className="text-xs text-zinc-400">{member.divisaoName} • {member.grupamento}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block">STATUS</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{member.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#181c24] border-t border-zinc-800 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        target={{
          type: 'member',
          id: member.id,
          title: `${member.vulgo} (${member.name})`,
          subtitle: `Divisão: ${member.divisaoName} • Grupamento: ${member.grupamento}`,
          warning: `Tem certeza que deseja excluir o cadastro de ${member.vulgo}? O registro será removido permanentemente.`
        }}
      />
    </div>
  );
};
